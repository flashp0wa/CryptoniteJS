const {TraderLog} = require('../../../../Toolkit/Logger');
const {sproc_InsertIntoOrder, sproc_InsertIntoOrderPaper, sproc_InsertIntoOrderFailed} = require('../../../../DatabaseConnection/SQLConnector.js');

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
    this.conObj = conObj;
  }

  createOrder() {
    throw new Error('This function must be overridden.');
  }

  processOrderResponse() {
    throw new Error('This function must be overridden.');
  }
  /**
   * @param {object} databaseObj Object with values will be written to the database
   * @param {boolean} failed True when order is failed
   */
  writeToDatabase(databaseObj, failed) {
    if (process.env.CRYPTONITE_TRADE_MODE === 'Paper') {
      sproc_InsertIntoOrderPaper(databaseObj);
    } else if (failed) {
      sproc_InsertIntoOrderFailed(databaseObj);
    } else {
      sproc_InsertIntoOrder(databaseObj);
    }
  }
}

module.exports = {
  Order,
};
