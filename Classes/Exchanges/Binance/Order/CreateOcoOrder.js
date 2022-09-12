const {Order} = require('./OrderClass.js');

class CreateOcoOrder extends Order {
  constructor(excObj, conObj) {
    super(excObj, conObj);
    this.stopPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.stopPrice);
    this.stopLimitPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.stopPrice - conObj.stopPrice * 0.05));
    this.sellPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.sellPrice);
    this.parentOrderId;
    this.ocoOrderResponse;
  }

  processOrderResponse() {
    this.traderLog.info('Processing OCO order response...');

    const ocoStopLossDataObj = {
      symbol: this.ocoOrderResponse['orderReports'][0].symbol,
      orderId: this.ocoOrderResponse['orderReports'][0].orderId,
      eventTime: new Date(Number(this.ocoOrderResponse['orderReports'][0].transactTime)).toISOString(),
      orderType: (this.ocoOrderResponse['orderReports'][0].type).toLowerCase(),
      side: (this.ocoOrderResponse['orderReports'][0].side).toLowerCase(),
      price: this.ocoOrderResponse['orderReports'][0].price,
      stopPrice: this.ocoOrderResponse['orderReports'][0].stopPrice,
      amount: this.ocoOrderResponse['orderReports'][0].origQty,
      orderStatus: 'open',
      tradeStatus: this.ocoOrderResponse['orderReports'][0].status,
      exchange: this.exchangeName,
      parentOrderId: this.parentOrderId,
      siblingOrderId: this.ocoOrderResponse['orderReports'][1].orderId,
    };
    const ocoLimitDataObj = {
      symbol: this.ocoOrderResponse['orderReports'][1].symbol,
      orderId: this.ocoOrderResponse['orderReports'][1].orderId,
      eventTime: new Date(Number(this.ocoOrderResponse['orderReports'][1].transactTime)).toISOString(),
      orderType: (this.ocoOrderResponse['orderReports'][1].type).toLowerCase(),
      side: (this.ocoOrderResponse['orderReports'][1].side).toLowerCase(),
      price: this.ocoOrderResponse['orderReports'][1].price,
      amount: this.ocoOrderResponse['orderReports'][1].origQty,
      orderStatus: 'open',
      tradeStatus: this.ocoOrderResponse['orderReports'][1].status,
      exchange: this.exchangeName,
      parentOrderId: this.parentOrderId,
      siblingOrderId: this.ocoOrderResponse['orderReports'][0].orderId,
    };

    super.writeToDatabase(ocoLimitDataObj);
    super.writeToDatabase(ocoStopLossDataObj);
  }
  /**
   *
   * @return {Object} //Returns Limit and StopLimit orderID
   */
  async createOrder() {
    try {
      this.traderLog.info(`New OCO order. \
        Symbol: ${this.symbol}, Side: Sell, \
        Order Amount: ${this.orderAmount}, Price: ${this.sellPrice}, \
        Stop-Price: ${this.stopPrice}, Stop-Limit-Price: ${this.stopLimitPrice}`,
      );

      this.ocoOrderResponse = await this.exchangeObj.privatePostOrderOco({
        symbol: this.symbol,
        side: 'sell',
        quantity: this.orderAmount,
        price: this.sellPrice,
        stopPrice: this.stopPrice,
        stopLimitPrice: this.stopLimitPrice,
        stopLimitTimeInForce: 'GTC',
      });

      this.traderLog.info('OCO order has been created.');
      try {
        this.processOrderResponse();
        this.traderLog.info('OCO order response has been processed');
        return {
          ocoLimitId: this.ocoOrderResponse['orderReports'][1].orderId,
          ocoStopLossLimitId: this.ocoOrderResponse['orderReports'][0].orderId,
          ocoOrderListId: this.ocoOrderResponse.orderListId,
        };
      } catch (error) {
        this.traderLog.error(`Could not process OCO order response. ${error.stack}`);
      }
    } catch (error) {
      this.traderLog.error(`OCO order creation failed. ${error.stack}`);
    }
  }
}

module.exports = {
  CreateOcoOrder,
};
