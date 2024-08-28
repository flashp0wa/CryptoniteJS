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
        listClientOrderId: '',
      };

      this.orderResponse = await this.exchangeObj.privatePostOrderOco(orderObj);
      this.traderLog.log({
        level: 'info',
        message: 'OCO order has been created.',
        senderFunction: 'createOrder',
        file: 'CreateOcoOrder.js',
      });
      this.processOrderResponse();
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
