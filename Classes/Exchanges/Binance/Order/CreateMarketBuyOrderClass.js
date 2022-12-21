const {Order} = require('./OrderClass.js');
const {CreateOcoOrder} = require('./CreateOcoOrder.js');


class CreateMarketBuyOrder extends Order {
  /**
   *
   * @param {object} excObj
   * @param {object} conObj
   * {
   *  symbol,
   *  side,
   *  orderType,
   *  orderAmount,
   *  buyPrice,
   *  stopPrice,
   *  sellPrice,
   * }
   */
  constructor(excObj, conObj) {
    super(excObj, conObj);
    this.ocoOrder = new CreateOcoOrder(excObj, conObj);
    this.buyPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.buyPrice));
    this.marketOrderResponse;
  }
  /**
   * Write order response data to database
   * @param {object} inObj Input object
   */
  processOrderResponse(inObj) {
    this.traderLog.info('Processing market order response...');
    const marketDataObj = {
      symbol: this.marketOrderResponse.info.symbol,
      orderId: this.marketOrderResponse.id,
      eventTime: this.marketOrderResponse.datetime,
      orderType: this.marketOrderResponse.type,
      side: this.marketOrderResponse.side,
      price: this.marketOrderResponse.price,
      amount: this.marketOrderResponse.amount,
      filled: this.marketOrderResponse.filled,
      remaining: this.marketOrderResponse.remaining,
      orderStatus: this.marketOrderResponse.status,
      tradeStatus: this.marketOrderResponse.info.status,
      cost: this.marketOrderResponse.cost,
      exchange: this.exchangeName,
      ocoLimitId: inObj.ocoLimitId,
      ocoStopLossLimitId: inObj.ocoStopLossLimitId,
    };
    if (typeof this.marketOrderResponse.fee === 'undefined') {
      marketDataObj.fee = 0;
    } else {
      marketDataObj.fee = this.marketOrderResponse.fee.cost * this.marketOrderResponse.price; // convert fee to USD
    }

    super.writeToDatabase(marketDataObj);
  }
  /**
   * Creates the market order with it's corresponding OCO order and then writes the response to the database.
   */
  async createOrder() {
    this.traderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
    let ocoId;

    try {
      this.marketOrderResponse = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.buyPrice);
      this.traderLog.info(`New market order has been created.`);
      this.ocoOrder.parentOrderId = this.marketOrderResponse.id;

      try {
        ocoId = await this.ocoOrder.createOrder();
      } catch (error) {
        this.traderLog.error('Oco order creation failed.');
      }

      try {
        this.processOrderResponse(ocoId);
        this.traderLog.info('Market order response has been processed');
      } catch (error) {
        this.traderLog.error(`Failed to write order response to database. ${error.stack}`);
      }
    } catch (error) {
      this.traderLog.error(`Market order creation failed. ${error.stack}`);
    }
  }
}

module.exports = {
  CreateMarketBuyOrder,
};
