const {Order} = require('./OrderClass.js');

class CreateOcoOrder extends Order {
  /**
   *
   * @param {object} excObj Exchange object
   * @param {object} conObj Constructor object
   */
  constructor(excObj, conObj) {
    super(excObj, conObj);
    this.parentOrderId;
  }
  /**
   * Write order response data to database
   */
  processOrderResponse() {
    try {
      this.traderLog.info('Processing OCO order response...');
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
      };

      super.writeToDatabase(ocoLimitDataObj);
      super.writeToDatabase(ocoStopLossDataObj);
      this.traderLog.info('OCO order response has been processed');
    } catch (error) {
      this.traderLog.error(`Could not process OCO order response. ${error.stack}`);
    }
  }
  /**
   * Creates OCO order
   * @return {Object} //Returns Limit and StopLimit orderID
   */
  async createOrder() {
    try {
      this.traderLog.info(`New OCO order. \
        Symbol: ${this.symbol}, Side: Sell, \
        Order Amount: ${this.orderAmount}, Limit Price: ${this.limitPrice}, \
        Stop-Price: ${this.stopPrice}, Stop-Limit-Price: ${this.stopLimitPrice}`,
      );

      this.orderResponse = await this.exchangeObj.privatePostOrderOco({
        symbol: this.symbol,
        side: 'sell',
        quantity: this.orderAmount,
        price: this.limitPrice,
        stopPrice: this.stopPrice,
        stopLimitPrice: this.stopLimitPrice,
        stopLimitTimeInForce: 'GTC',
      });

      this.traderLog.info('OCO order has been created.');
      this.processOrderResponse();
      return {
        ocoLimitId: this.orderResponse['orderReports'][1].orderId,
        ocoStopLossLimitId: this.orderResponse['orderReports'][0].orderId,
        ocoOrderListId: this.orderResponse.orderListId,
      };
    } catch (error) {
      this.traderLog.error(`OCO order creation failed. ${error.stack}`);
    }
  }
}

module.exports = {
  CreateOcoOrder,
};
