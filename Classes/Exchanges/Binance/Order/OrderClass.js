const {TraderLog} = require('../../../../Toolkit/Logger');
const {getDatabase} = require('../../../Database');

class Order {
  constructor(excObj, excName, conObj) {
    this.exchangeObj = excObj;
    this.exchangeName = excName;
    this.symbol = conObj.symbol;
    this.timeFrame = conObj.timeFrame;
    this.type = conObj.type;
    this.stopLossType = excName === 'binanceFutures' || 'binanceFuturesTest' ? 'STOP_MARKET' : 'STOP_LOSS_LIMIT';
    this.takeProfitType = excName === 'binanceFutures' || 'binanceFuturesTest' ? 'TAKE_PROFIT_MARKET' : 'TAKE_PROFIT_LIMIT';
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
    this.db = getDatabase();
    this.tradeMode = process.env.CRYPTONITE_TRADE_MODE;
    this.siblingOrderId;
    this.orderId = conObj.orderId ? conObj.orderId : null;
    this.isReOpen = conObj.isReOpen ? conObj.reopen : false;
  }
  /**
   * Write order response data to database
   * @param {object} inObj Input object
   */
  processOrderResponse(inObj) {
    this.traderLog.log({
      level: 'info',
      message: `Processing order response`,
      senderFunction: 'processOrderResponse',
      file: 'createOrderClass.js',
    });
    try {
      const dataObj = {
        eventTime: this.orderResponse.datetime,
        updateTime: this.orderResponse.info.updateTime ? new Date(Number(this.orderResponse.info.updateTime)).toISOString() : null,
        orderId: this.orderResponse.id,
        symbol: this.orderResponse.info.symbol,
        orderType: this.orderResponse.type,
        side: this.orderResponse.side,
        price: this.orderResponse.price,
        stopPrice: this.orderResponse.stopPrice,
        amount: this.orderResponse.amount,
        cost: this.orderResponse.cost,
        filled: this.orderResponse.filled,
        remaining: this.orderResponse.remaining,
        timeInForce: this.orderResponse.timeInForce,
        postOnly: this.orderResponse.postOnly,
        reduceOnly: this.orderResponse.reduceOnly,
        priceProtect: this.orderResponse.info.priceProtect,
        workingType: this.orderResponse.info.workingType,
        positionSide: this.orderResponse.info.positionSide,
        orderStatus: this.orderResponse.status,
        tradeStatus: this.orderResponse.info.status,
        exchange: this.exchangeName,
        oco: false,
        ocoLimitId: !inObj ? null : inObj.ocoLimitId,
        ocoStopLossLimitId: !inObj ? null : inObj.ocoStopLossLimitId,
        parentOrderId: this.parentOrderId ? this.parentOrderId : null,
        siblingOrderId: this.siblingOrderId ? this.siblingOrderId : null,
        strategy: this.strategy,
      };
      if (typeof this.orderResponse.fee === 'undefined') {
        dataObj.fee = null;
      } else {
        dataObj.fee = this.orderResponse.fee.cost * this.orderResponse.price; // convert fee to USD
      }

      this.traderLog.log({
        level: 'info',
        message: 'NEW ORDER',
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
        obj: dataObj,
        discord: 'successful-orders',
      });

      this.writeToDatabase(dataObj);
      this.traderLog.log({
        level: 'info',
        message: 'Order response has been processed',
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Failed to write order response to database. ${error.stack}`,
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
        discord: 'application-errors',
      });
    }
  }
  /**
   * @param {object} databaseObj Object with values will be written to the database
   * @param {boolean} failed True when order is failed
   */
  writeToDatabase(databaseObj, failed) {
    if (this.tradeMode === 'Paper') {
      this.db.sproc_InsertIntoOrderPaper(databaseObj);
    } else if (failed) {
      this.db.sproc_InsertIntoOrderFailed(databaseObj);
    } else {
      this.db.sproc_InsertIntoOrder(databaseObj);
    }
  }
}

module.exports = {
  Order,
};
