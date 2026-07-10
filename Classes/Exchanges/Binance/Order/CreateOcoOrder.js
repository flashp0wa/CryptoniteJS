const {Order} = require('./OrderClass.js');

class CreateOcoOrder extends Order {
  /**
   *
   * @param {object} excObj Exchange object
   * @param {string} excName Exchange string
   * @param {object} conObj Constructor object
   */
  constructor(excObj, excName, conObj) {
    super(excObj, excName, conObj);
    this.parentOrderId;
  }
  /**
   * Writes each raw leg of the OCO order response (orderReports[0] is the STOP leg,
   * orderReports[1] is the LIMIT leg) straight to the database as JSON, merged with
   * metadata the exchange doesn't know about (linkage, strategy).
   *
   * Binance's raw OCO leg shape (orderId/origQty/transactTime/...) differs from ccxt's
   * unified order shape that the main order path writes. To let both paths share one
   * stored procedure, each leg is nested under `info` (mirroring ccxt's own convention
   * of unified fields + raw `info`) with just enough top-level fields added to line up
   * with the ccxt shape - no data is dropped, only addressed under consistent keys.
   */
  processOrderResponse() {
    this.traderLog.log({
      level: 'info',
      message: 'Processing OCO order response...',
      senderFunction: 'processOrderResponse',
      file: 'CreateOcoOrder.js',
    });
    try {
      const [stopLossLeg, limitLeg] = this.orderResponse['orderReports'];
      const legMetadata = {
        exchange: this.exchangeName,
        parentOrderId: this.parentOrderId,
        oco: true,
        strategy: this.strategy,
      };
      const toOrderPayload = (leg) => ({
        id: leg.orderId,
        datetime: new Date(Number(leg.transactTime)).toISOString(),
        type: leg.type,
        side: leg.side,
        price: leg.price,
        stopPrice: leg.stopPrice,
        amount: leg.origQty,
        status: 'open', // OCO legs are freshly placed and working
        info: leg,
        ...legMetadata,
      });
      const stopLossPayload = toOrderPayload(stopLossLeg);
      const limitPayload = toOrderPayload(limitLeg);

      this.traderLog.log({
        level: 'info',
        message: 'One-Cancles-the-Other || LIMIT',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
        obj: limitPayload,
        discord: 'successful-orders',
      });
      this.traderLog.log({
        level: 'info',
        message: 'One-Cancles-the-Other || STOP',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
        obj: stopLossPayload,
        discord: 'successful-orders',
      });

      super.writeToDatabase(JSON.stringify(limitPayload));
      super.writeToDatabase(JSON.stringify(stopLossPayload));
      this.traderLog.log({
        level: 'info',
        message: 'OCO order response has been processed',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Could not process OCO order response. ${error.stack}`,
        senderFunction: 'createOrder',
        file: 'CreateOcoOrder.js',
        discord: 'application-errors',
      });
    }
  }
  /**
   * Creates OCO order
   * @return {Object} //Returns Limit and StopLimit orderID
   */
  async createOrder() {
    try {
      this.traderLog.log({
        level: 'info',
        message: 'New OCO order',
        senderFunction: 'createOrder',
        file: 'CreateOcoOrder.js',
      });


      const orderObj = {
        symbol: this.symbol,
        side: 'sell',
        quantity: this.orderAmount,
        price: this.limitPrice,
        stopPrice: this.stopPrice,
        stopLimitPrice: this.stopLimitPrice,
        stopLimitTimeInForce: 'GTC',
      };

      this.orderResponse = await this.exchangeObj.privatePostOrderOco(orderObj);
      this.traderLog.log({
        level: 'info',
        message: 'OCO order has been created.',
        senderFunction: 'createOrder',
        file: 'CreateOcoOrder.js',
      });
      this.processOrderResponse();
      return {
        ocoLimitId: this.orderResponse['orderReports'][1].orderId,
        ocoStopLossLimitId: this.orderResponse['orderReports'][0].orderId,
        ocoOrderListId: this.orderResponse.orderListId,
      };
    } catch (error) {
      this.traderLog.error(`OCO order creation failed. ${error}`);
      this.traderLog.log({
        level: 'error',
        message: `OCO order creation failed. ${error}`,
        senderFunction: 'createOrder',
        file: 'CreateOcoOrder.js',
        discord: 'failed-orders',
      });
    }
  }
}

module.exports = {
  CreateOcoOrder,
};
