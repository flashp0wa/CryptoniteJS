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
    this.isReOpen = conObj.reopen ? conObj.reopen : false;
    this.leverage = this.getLeverage();
  }
  /**
   * Writes the raw exchange order response straight to the database as JSON, merged with
   * metadata the exchange doesn't know about (linkage, strategy, leverage).
   * @param {object} inObj Optional OCO leg ids ({ocoLimitId, ocoStopLossLimitId}) for the parent order of an OCO pair
   */
  processOrderResponse(inObj) {
    this.traderLog.log({
      level: 'info',
      message: `Processing order response`,
      senderFunction: 'processOrderResponse',
      file: 'createOrderClass.js',
    });
    try {
      const payload = {
        ...this.orderResponse,
        exchange: this.exchangeName,
        oco: false,
        ocoLimitId: inObj ? inObj.ocoLimitId : null,
        ocoStopLossLimitId: inObj ? inObj.ocoStopLossLimitId : null,
        parentOrderId: this.parentOrderId ? this.parentOrderId : null,
        siblingOrderId: this.siblingOrderId ? this.siblingOrderId : null,
        strategy: this.strategy,
        timeFrame: this.timeFrame,
        leverage: this.leverage,
      };

      this.traderLog.log({
        level: 'info',
        message: 'NEW ORDER',
        senderFunction: 'processOrderResponse',
        file: 'OrderClass.js',
        obj: payload,
        discord: 'successful-orders',
      });

      this.writeToDatabase(JSON.stringify(payload));
      this.traderLog.log({
        level: 'info',
        message: 'Order response has been processed',
        senderFunction: 'processOrderResponse',
        file: 'OrderClass.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Failed to write order response to database. ${error.stack}`,
        senderFunction: 'processOrderResponse',
        file: 'OrderClass.js',
        discord: 'application-errors',
      });
    }
  }
  /**
   * @param {string} json JSON string to persist as-is; the stored procedure extracts columns from it
   * @param {boolean} failed True when order is failed
   */
  writeToDatabase(json, failed) {
    if (this.tradeMode === 'Paper') {
      this.db.sproc_InsertIntoOrderPaper(json);
    } else if (failed) {
      this.db.sproc_InsertIntoOrderFailed(json);
    } else {
      this.db.sproc_InsertIntoOrder(json);
    }
  }

  async getLeverage() {
    try {
      const leverage = await this.db.singleRead(`select * from itvf_GetLeverage('${this.symbol}', '${this.exchangeName}')`);
      if (!leverage.length) {
        this.leverage = null;
      } else {
        this.leverage = leverage[0].amount;
      }
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Failed to fetch leverage from database. ${error.stack}`,
        senderFunction: 'getLeverage',
        file: 'OrderClass.js',
      });
    }
  }
}

module.exports = {
  Order,
};
