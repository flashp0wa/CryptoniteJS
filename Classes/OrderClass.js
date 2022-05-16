const dataBank = require('../Loaders/LoadDataBank.js');
const {TraderLog} = require('../Toolkit/Logger.js');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const {writeToDatabase} = require('../DatabaseConnection/SQLConnector.js');

class Order {
  constructor(conObj) {
    this.symbol = conObj.symbol;
    this.price = conObj.price;
    this.side = conObj.side;
    this.exchangeName = conObj.exchange;
    this.exchangeObj = dataBank.getCcxtExchange(conObj.exchange);
    this.orderAmountPercent = conObj.orderAmountPercent;
    this.orderAmount = conObj.orderAmount || false;
    this.orderType = conObj.orderType;
    this.useLastOrderCost = conObj.useLastOrderCost || false;
    this.stopLossPrice = conObj.stopLossPrice;
    this.sellPrice = conObj.sellPrice;
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

      const orderPrice = this.price + (this.price * 0.003); // place order 0.3% higher than market price

      switch (this.orderType) {
        case 'createMarketOrder':
          TraderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${orderPrice}`);
          const response = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, orderPrice);
          globalEvent.emit('SendMail', `New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${orderPrice}`);
          this.processOrderResponse(response);
          dataBank.lastSellOrderCost('set', this.symbol, response.cost);
          TraderLog.info(`New market order has been created. Id: ${response.id}`);
          if (this.side === 'buy') {
            const stopLimitPrice = this.stopLossPrice
            const stopPrice = stopLimitPrice + stopLimitPrice * 0.01;

            await this.exchangeObj.createOrder(this.symbol, 'stop_loss_limit', 'sell', this.orderAmount, stopLimitPrice, {'stopPrice': stopPrice});
            TraderLog.info('Stop-Limit order has been created for the buy order');
            await this.exchangeObj.createLimitSellOrder(this.symbol, this.orderAmount, this.sellPrice);
            TraderLog.info('Limit-sell order has been creted for the buy order');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      TraderLog.info(`Error in creation of Order: ${error.message}`);
    }
  }
}

module.exports = {
  Order,
};
