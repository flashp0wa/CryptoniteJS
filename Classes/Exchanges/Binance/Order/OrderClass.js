const {TraderLog} = require('../../../../Toolkit/Logger.js');
const {writeToDatabase} = require('../../../../DatabaseConnection/SQLConnector.js');

class Order {
  constructor(excObj, conObj) {
    this.exchangeObj = excObj;
    this.symbol = conObj.symbol;
    this.side = conObj.side;
    this.exchangeName = conObj.exchange;
    this.orderAmount = conObj.orderAmount ? this.exchangeObj.decimalToPrecision(conObj.orderAmount, 'ROUND', 2, 'DECIMAL_PLACES') : false;
    this.traderLog = TraderLog;
  }

  createOrder() {
    throw new Error('This function must be overridden.');
  }

  processOrderResponse() {
    throw new Error('This function must be overridden.');
  }

  writeToDatabase(databaseObj, param) {
    writeToDatabase(databaseObj, param);
  }
}

module.exports = {
  Order,
};
