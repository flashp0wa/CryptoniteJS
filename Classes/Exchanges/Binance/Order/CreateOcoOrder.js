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
   * Write order response data to database
   */
  processOrderResponse() {
    try {
      this.traderLog.log({
        level: 'info',
        message: 'Processing OCO order response...',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
      });
      const ocoStopLossDataObj = {
        symbol: this.orderResponse['orderReports'][0].symbol,
        orderId: this.orderResponse['orderReports'][0].orderId,
        eventTime: new Date(Number(this.orderResponse['orderReports'][0].transactTime)).toISOString(),
        orderType: (this.orderResponse['orderReports'][0].type).toLowerCase(),
        side: (this.orderResponse['orderReports'][0].side).toLowerCase(),
        price: this.orderResponse['orderReports'][0].price,
        stopPrice: this.orderResponse['orderReports'][0].stopPrice,
        amount: this.orderResponse['orderReports'][0].origQty,
        orderStatus: 'open',
        tradeStatus: this.orderResponse['orderReports'][0].status,
        exchange: this.exchangeName,
        parentOrderId: this.parentOrderId,
        siblingOrderId: this.orderResponse['orderReports'][1].orderId,
        oco: true,
        strategy: this.strategy,
      };
      const ocoLimitDataObj = {
        symbol: this.orderResponse['orderReports'][1].symbol,
        orderId: this.orderResponse['orderReports'][1].orderId,
        eventTime: new Date(Number(this.orderResponse['orderReports'][1].transactTime)).toISOString(),
        orderType: (this.orderResponse['orderReports'][1].type).toLowerCase(),
        side: (this.orderResponse['orderReports'][1].side).toLowerCase(),
        price: this.orderResponse['orderReports'][1].price,
        amount: this.orderResponse['orderReports'][1].origQty,
        orderStatus: 'open',
        tradeStatus: this.orderResponse['orderReports'][1].status,
        exchange: this.exchangeName,
        parentOrderId: this.parentOrderId,
        siblingOrderId: this.orderResponse['orderReports'][0].orderId,
        oco: true,
        strategy: this.strategy,
      };

      this.traderLog.log({
        level: 'info',
        message: 'One-Cancles-the-Other || LIMIT',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
        obj: ocoLimitDataObj,
        discord: 'successful-orders',
      });
      this.traderLog.log({
        level: 'info',
        message: 'One-Cancles-the-Other || STOP',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
        obj: ocoStopLossDataObj,
        discord: 'successful-orders',
      });

      super.writeToDatabase(ocoLimitDataObj);
      super.writeToDatabase(ocoStopLossDataObj);
      this.traderLog.log({
        level: 'info',
        message: 'OCO order response has been processed',
        senderFunction: 'processOrderResponse',
        file: 'CreateOcoOrder.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Could not process OCO order response. ${error}`,
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
