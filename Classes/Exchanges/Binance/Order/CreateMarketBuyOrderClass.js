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
   *  buy,
   * }
   */
  constructor(excObj, conObj) {
    super(excObj, conObj);
    this.ocoOrder = new CreateOcoOrder(excObj, conObj);
    this.buyPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.buyPrice));
    this.marketOrderResponse;
  }

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
      fee: this.marketOrderResponse.fee.cost * this.marketOrderResponse.price, // convert fee to USD
      filled: this.marketOrderResponse.filled,
      remaining: this.marketOrderResponse.remaining,
      orderStatus: this.marketOrderResponse.status,
      tradeStatus: this.marketOrderResponse.info.status,
      cost: this.marketOrderResponse.cost,
      exchange: this.exchangeName,
      ocoLimitId: inObj.ocoLimitId,
      ocoStopLossLimitId: inObj.ocoStopLossLimitId,
    };

    super.writeToDatabase({
      dataObj: marketDataObj,
      table: `cry_order_${marketDataObj.side}`,
      statement: 'INSERT INTO',
    });

    this.traderLog.info('Market order response has been processed');
  }

  async createOrder() {
    this.traderLog.info(`New market order. Symbol: ${this.symbol}, Side: ${this.side}, Amount: ${this.orderAmount}, Price: ${this.buyPrice}`);
    let ocoId;
    try {
      this.marketOrderResponse = await this.exchangeObj.createMarketOrder(this.symbol, this.side, this.orderAmount, this.buyPrice);
      this.traderLog.info(`New market order has been created.`);
      this.ocoOrder.parentOrderId = this.marketOrderResponse.id;
    } catch (error) {
      this.traderLog.error(`Market order creation failed. ${error.stack}`);
    }
    try {
      ocoId = await this.ocoOrder.createOrder();
    } catch (error) {
      try {
        this.processOrderResponse();
      } catch (error) {
        this.traderLog.error(`Failed to write market data to database. ${error.stack}`);
      }
      this.traderLog.error('Oco order creation failed.');
    }
    try {
      this.processOrderResponse(ocoId);
    } catch (error) {
      this.traderLog.error(`Failed to write order response to database. ${error.stack}`);
    }
  }
}

module.exports = {
  CreateMarketBuyOrder,
};
