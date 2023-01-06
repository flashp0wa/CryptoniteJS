const {TraderLog} = require('../../../../Toolkit/Logger.js');
const {sproc_InsertIntoOrder, sproc_InsertIntoOrderPaper} = require('../../../../DatabaseConnection/SQLConnector.js');

class Order {
  constructor(excObj, excName, conObj) {
    this.exchangeObj = excObj;
    this.exchangeName = excName;
    this.symbol = conObj.symbol;
    this.type = conObj.type;
    this.side = conObj.side;
    this.orderAmount = conObj.orderAmount ? this.exchangeObj.decimalToPrecision(conObj.orderAmount, 'ROUND', 2, 'DECIMAL_PLACES') : false;
    this.price = this.exchangeObj.priceToPrecision(this.symbol, conObj.price);
    this.limitPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.limitPrice);
    this.stopPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.stopPrice);
    this.stopLimitPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.stopPrice - conObj.stopPrice * 0.01));
    this.orderResponse;
    this.traderLog = TraderLog;
    this.strategy = conObj.strategy;
  }

  createOrder() {
    throw new Error('This function must be overridden.');
  }

  processOrderResponse() {
    throw new Error('This function must be overridden.');
  }
  /**
   * @param {object} databaseObj Object with values will be written to the database
   */
  writeToDatabase(databaseObj) {
    if (process.env.CRYPTONITE_TRADE_MODE === 'Paper') {
      sproc_InsertIntoOrderPaper(databaseObj);
    } else {
      sproc_InsertIntoOrder(databaseObj);
    }
  }
}

module.exports = {
  Order,
};
