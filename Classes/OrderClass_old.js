const dataBank = require('../Loaders/LoadDataBank.js');
const {TraderLog} = require('../Toolkit/Logger.js');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const {writeToDatabase} = require('../DatabaseConnection/SQLConnector.js');

class Order {
  constructor(conObj) {
    this.exchangeObj = dataBank.getCcxtExchange(conObj.exchange);
    this.symbol = conObj.symbol;
    this.price = conObj.price;
    this.side = conObj.side;
    this.exchangeName = conObj.exchange;
    this.orderAmountPercent = conObj.orderAmountPercent;
    this.orderType = conObj.orderType;
    this.useLastOrderCost = conObj.useLastOrderCost || false;
    this.orderAmount = conObj.orderAmount ? this.exchangeObj.decimalToPrecision(conObj.orderAmount, 'ROUND', 2, 'DECIMAL_PLACES') : false;
    this.stopLimitPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.stopPrice - conObj.stopPrice * 0.05));
    this.stopPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.stopPrice);
    this.sellPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.sellPrice);
    this.buyPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.buyPrice + conObj.buyPrice * 0.003));
  }

  processOrderResponse(inObj) {
    TraderLog.info('Processing order response...');
    let marketDataObj;
    let limitDataObj;
    let ocoStopLossDataObj;
    let ocoLimitDataObj;
    if (inObj.marketOrderResponse) {
      const responseType = 'marketOrderResponse';
      marketDataObj = {
        symbol: inObj[responseType].info.symbol,
        orderId: inObj[responseType].id,
        eventTime: inObj[responseType].datetime,
        orderType: inObj[responseType].type,
        side: inObj[responseType].side,
        price: inObj[responseType].price,
        amount: inObj[responseType].amount,
        cost: inObj[responseType].cost,
        filled: inObj[responseType].filled,
        remaining: inObj[responseType].remaining,
        status: inObj[responseType].status,
        fee: inObj[responseType].fee.cost,
        exchange: this.exchangeName,
      };
    }
    if (inObj.limitOrderResponse) {
      const responseType = 'limitOrderResponse';
      limitDataObj = {
        symbol: inObj[responseType].info.symbol,
        orderId: inObj[responseType].id,
        eventTime: inObj[responseType].datetime,
        orderType: inObj[responseType].type,
        side: inObj[responseType].side,
        price: inObj[responseType].price,
        amount: inObj[responseType].amount,
        cost: inObj[responseType].cost,
        filled: inObj[responseType].filled,
        remaining: inObj[responseType].remaining,
        status: inObj[responseType].status,
        fee: inObj[responseType].fee.cost,
        exchange: this.exchangeName,
      };
    }
    if (inObj.ocoOrderResponse) {
      const responseType = 'ocoOrderResponse';
      ocoStopLossDataObj = {
        symbol: inObj[responseType]['orderReports'][0].symbol,
        orderId: inObj[responseType]['orderReports'][0].orderId,
        eventTime: new Date(Number(inObj[responseType]['orderReports'][0].transactTime)).toISOString(),
        orderType: (inObj[responseType]['orderReports'][0].type).toLowerCase(),
        side: (inObj[responseType]['orderReports'][0].side).toLowerCase(),
        price: inObj[responseType]['orderReports'][0].price,
        stopPrice: inObj[responseType]['orderReports'][0].stopPrice,
        amount: inObj[responseType]['orderReports'][0].origQty,
        status: 'open',
        exchange: this.exchangeName,
      };
      ocoLimitDataObj = {
        symbol: inObj[responseType]['orderReports'][1].symbol,
        orderId: inObj[responseType]['orderReports'][1].orderId,
        eventTime: new Date(Number(inObj[responseType]['orderReports'][1].transactTime)).toISOString(),
        orderType: (inObj[responseType]['orderReports'][1].type).toLowerCase(),
        side: (inObj[responseType]['orderReports'][1].side).toLowerCase(),
        price: inObj[responseType]['orderReports'][1].price,
        amount: inObj[responseType]['orderReports'][1].origQty,
        status: 'open',
        exchange: this.exchangeName,
      };
    }
    // convert fee to USD
    if (inObj.marketOrderResponse.side === 'buy') {
      inObj.marketOrderResponse.fee.cost = inObj.marketOrderResponse.fee.cost * inObj.marketOrderResponse.price;
    }

    let databaseObj;
    if (!inObj.ocoOrderResponse) {
      if (inObj.marketOrderResponse) {
        databaseObj = {
          dataObj: marketDataObj,
          table: `cry_order_${this.side}`,
          statement: 'INSERT INTO',
        };
      } else if (inObj.limitOrderResponse) {
        databaseObj = {
          dataObj: limitDataObj,
          table: `cry_order_${this.side}`,
          statement: 'INSERT INTO',
        };
      }
      writeToDatabase(databaseObj, {insertIntoAll: false});
    } else {
      const param = {insertIntoAll: false};
      marketDataObj.ocoLimitId = ocoLimitDataObj.orderId;
      marketDataObj.ocoStopLossLimitId = ocoStopLossDataObj.orderId;
      ocoLimitDataObj.marketOrderId = marketDataObj.orderId;
      ocoStopLossDataObj.marketOrderId = marketDataObj.orderId;

      writeToDatabase({
        dataObj: marketDataObj,
        table: `cry_order_${marketDataObj.side}`,
        statement: 'INSERT INTO',
      }, param);
      writeToDatabase({
        dataObj: ocoLimitDataObj,
        table: `cry_order_${ocoLimitDataObj.side}`,
        statement: 'INSERT INTO',
      }, param);
      writeToDatabase({
        dataObj: ocoStopLossDataObj,
        table: `cry_order_${ocoStopLossDataObj.side}`,
        statement: 'INSERT INTO',
      }, param);
      TraderLog.info('All order response has been processed');
    }
  }

  async calcOrderVol() {
    try {
      let lastSellOrderCost;
      const symbol = this.symbol;
      const ticker = await this.exchangeObj.fetchTicker(symbol);
      let orderAmount;

      if (this.useLastOrderCost) {
        lastSellOrderCost = await dataBank.lastSellOrderCost('get', symbol);
        const newOrderCost = (lastSellOrderCost / 100) * this.orderAmountPercent;
        orderAmount = Math.floor(newOrderCost / ticker.last); // You get the amount of coins you can buy from the last sell trade
      } else {
        const baseAssetName = ticker.symbol.split('/')[0]; // ADA/USDT
        const allAssets = await this.exchangeObj.fetchBalance();
        const baseAssetVol = allAssets.free[baseAssetName];
        orderAmount = Math.floor((baseAssetVol / 100) * this.orderAmountPercent);
      }
      return orderAmount;
    } catch (error) {
      console.log(error);
    }
  }

  async createOcoOrder() {
    try {
      TraderLog.info(`New OCO order. \
        Symbol: ${this.symbol}, Side: Sell, \
        Order Amount: ${this.orderAmount}, Price: ${this.sellPrice}, \
        Stop-Price: ${this.stopPrice}, Stop-Limit-Price: ${this.stopLimitPrice}`,
      );

      const ocoResp = await this.exchangeObj.privatePostOrderOco({
        symbol: this.symbol,
        side: 'sell',
        quantity: this.orderAmount,
        price: this.sellPrice,
        stopPrice: this.stopPrice,
        stopLimitPrice: this.stopLimitPrice,
        stopLimitTimeInForce: 'GTC',
      });

      TraderLog.info('OCO order has been creted for the buy order');

      return ocoResp;
    } catch (error) {
      TraderLog.error(`OCO order creation failed. ${error}`);
    }
  }

  async createOrder() {
    const globalEvent = returnEmitter();
    if (!this.orderAmount) {
      this.orderAmount = await this.calcOrderVol();
    }
    const responseObj = {};

    switch (this.orderType) {
      case 'createMarketOrder':
        if (this.side === 'buy') {
          try {
            TraderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
            const marketResp = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.buyPrice);
            TraderLog.info(`New market order has been created. Id: ${marketResp.id}`);
            globalEvent.emit('SendMail', `New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
            const ocoResp = await this.createOcoOrder();
            responseObj.marketOrderResponse = marketResp;
            responseObj.ocoOrderResponse = ocoResp;

            try {
              this.processOrderResponse(responseObj);
            } catch (error) {
              TraderLog.error('Failed to write order response to database.');
            }
          } catch (error) {
            TraderLog.error(`Market order creation failed. ${error}`);
          }
        } else {
          try {
            TraderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.sellPrice}`);
            const marketResp = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.sellPrice);
            TraderLog.info(`New market order has been created. Id: ${marketResp.id}`);
            responseObj.marketOrderResponse = marketResp;
            try {
              this.processOrderResponse(responseObj);
            } catch (error) {
              TraderLog.error('Failed to write order response to database.');
            }
            // dataBank.lastSellOrderCost('set', this.symbol, marketResp.cost);
          } catch (error) {
            TraderLog.error(`Market order creation failed. ${error}`);
          }
        }
        break;
      case 'createLimitOrder':
        TraderLog.info(`New limit order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.sellPrice}`);
      default:
        break;
    }
  }
}

module.exports = {
  Order,
};
