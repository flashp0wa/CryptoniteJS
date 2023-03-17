const {Order} = require('./OrderClass');

class CreateTakeProfitOrder extends Order {
  /**
     *
     * @param {object} excObj
     * @param {string} excName
     * @param {object} conObj
     * @param {string} orderType
     * {
     *  symbol,
     *  side,
     *  type,
     *  orderAmount,
     *  price,
     *  stopPrice,
     *  limitPrice,
     *  strategy,
     * }
     */
  constructor(excObj, excName, conObj) {
    super(excObj, excName, conObj);
    this.side = conObj.side === 'buy' ? 'sell' : 'buy';
    this.parentOrderId;
  }

  async createOrder() {
    this.traderLog.log({
      level: 'info',
      message: `Creating ${this.type} order`,
      senderFunction: 'createOrder',
      file: 'CreateTakerProfitOrderClass.js',
    });
    try {
      this.orderResponse = await this.exchangeObj.createOrder(
          this.symbol,
          this.takeProfitType,
          this.side,
          this.orderAmount,
          this.price, {
            stopPrice: this.limitPrice,
          });
      this.traderLog.log({
        level: 'info',
        message: `${this.type} order has been created`,
        senderFunction: 'createOrder',
        file: 'CreateTakerProfitOrderClass.js',
      });
      return this.orderResponse.id;
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Failed to create ${this.type} order. ${error.stack}`,
        senderFunction: 'createOrder',
        file: 'CreateTakerProfitOrderClass.js',
        discord: 'failed-orders',
      });
    }
  }
}

module.exports = CreateTakeProfitOrder;
