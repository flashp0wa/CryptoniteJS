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
    this.orderAmount = this.exchangeObj.decimalToPrecision(conObj.orderAmount, 'ROUND', 2, 'DECIMAL_PLACES') || false;
    this.stopLimitPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.stopLimitPrice);
    this.stopPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.stopLimitPrice + conObj.stopLimitPrice * 0.01))
    this.sellPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.sellPrice);
    this.buyPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.buyPrice + conObj.buyPrice * 0.003))
  }

  processOrderResponse(inObj) {
    if (!inObj.stopPrice) {
      inObj.stopPrice = 0;
    }
    if (!inObj.fee) {
      inObj.fee.cost = 0;
    }
    if (inObj.side === 'buy') {
      inObj.fee.cost = inObj.fee.cost * inObj.price; // converting fee to USD
    }


    const query = `INSERT INTO Orders VALUES (
      \'${inObj.info.symbol}\', \'${inObj.id}\', \'${inObj.datetime}\',
      \'${inObj.type}\', \'${inObj.side}\', \'${inObj.price}\',
      \'${inObj.stopPrice}\', \'${inObj.amount}\', \'${inObj.cost}\',
      \'${inObj.filled}\', \'${inObj.remaining}\', \'${inObj.status}\',
      \'${inObj.fee.cost}\', \'${this.exchangeName}\')`;
    TraderLog.info(`Writing to database. ${query}`);
    writeToDatabase(query);
  }

  async calcOrderVol() {
    try {
      let lastSellOrderCost;
      const symbol = this.symbol;
      const ticker = await this.exchangeObj.fetchTicker(symbol);
      let orderAmount;

      if (this.useLastOrderCost) {
        lastSellOrderCost = await dataBank.lastSellOrderCost('get', symbol);
        console.log(`Last sell: ${lastSellOrderCost}`);
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

  async createOrder() {
    const globalEvent = returnEmitter();
    try {
      if (!this.orderAmount) {
        this.orderAmount = await this.calcOrderVol();
      }

      switch (this.orderType) {
        case 'createMarketOrder':
          console.log(this.sellPrice)
          if (this.side === 'buy') {
            TraderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
            const response = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.buyPrice);
            TraderLog.info(`New market order has been created. Id: ${response.id}`);
            globalEvent.emit('SendMail', `New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
            
            this.processOrderResponse(response);
            
            const ocoResp = await this.exchangeObj.privatePostOrderOco({
              symbol: this.symbol,
              side: 'sell',
              quantity: this.orderAmount,
              price: this.sellPrice,
              stopPrice: this.stopPrice,
              stopLimitPrice: this.stopLimitPrice,
              stopLimitTimeInForce: 'GTC'
            });

            TraderLog.info('OCO order has been creted for the buy order');
          } else {
            TraderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.sellPrice}`);
            const response = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.sellPrice);
            TraderLog.info(`New market order has been created. Id: ${response.id}`);
            this.processOrderResponse(response);
            dataBank.lastSellOrderCost('set', this.symbol, response.cost);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      TraderLog.info(`Error occured while creating order for ${this.symbol}. ${error.message}`);
      globalEvent.emit('SendMail', `Error occured while creating order for ${this.symbol}. ${error.message}`)
    }
  }
}

module.exports = {
  Order,
};
