const {TraderLog} = require('../../../../Toolkit/Logger.js');
const {sproc_InsertIntoOrderBuy, sproc_InsertIntoOrderSell} = require('../../../../DatabaseConnection/SQLConnector.js');

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
  /**
   * Function decides which side's stored procedure to call based on the input object's side property
   * @param {object} databaseObj Object with values will be written to the database
   */
  writeToDatabase(databaseObj) {
    if (databaseObj.side === 'buy') {
      sproc_InsertIntoOrderBuy(databaseObj);
    } else {
      sproc_InsertIntoOrderSell(databaseObj);
    }
  }
}

module.exports = {
  Order,
};
