const {Order} = require('./OrderClass');

class CreateLimitBuyOrder extends Order {
  /**
   *
   * @param {object} excObj Exchange object
   * @param {object} conObj Constructor object
   */
  constructor(excObj, conObj) {
    super(excObj, conObj);
    this.limitOrderResponse;
    this.buyPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.buyPrice));
  }
  /**
   * Writes order response to database.
   */
  processOrderResponse() {
    this.traderLog.info('Processing limit order response...');
    const limitDataObj = {
      symbol: this.limitOrderResponse.info.symbol,
      orderId: this.limitOrderResponse.id,
      eventTime: this.limitOrderResponse.datetime,
      orderType: this.limitOrderResponse.type,
      side: this.limitOrderResponse.side,
      price: this.limitOrderResponse.price,
      amount: this.limitOrderResponse.amount,
      orderStatus: this.limitOrderResponse.status,
      tradeStatus: this.limitOrderResponse.info.status,
      cost: this.limitOrderResponse.cost,
      exchange: this.exchangeName,
      filled: null,
    };

    super.writeToDatabase(limitDataObj);
  }
  /**
   * Creates limit buy order and writes order response to database.
   */
  async createOrder() {
    this.traderLog.info(`New limit order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
    try {
      this.limitOrderResponse = await this.exchangeObj.createLimitBuyOrder(this.symbol, this.orderAmount, this.buyPrice);
      this.traderLog.info(`New limit order has been created.`);
    } catch (error) {
      this.traderLog.error(`Limit order creation failed. ${error.stack}`);
    }
    try {
      this.processOrderResponse(this.limitOrderResponse);
      this.traderLog.info('Limit order response has been processed');
    } catch (error) {
      this.traderLog.error(`Could not write limit order response to database. ${error.stack}`);
    }

    // this.ocoOrder.parentOrderId = this.limitOrderResponse.id;
  }
}

module.exports = {
  CreateLimitBuyOrder,
};
