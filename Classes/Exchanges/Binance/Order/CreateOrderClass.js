const {Order} = require('./OrderClass.js');
const {CreateOcoOrder} = require('./CreateOcoOrder.js');


class CreateOrder extends Order {
  /**
   *
   * @param {object} excObj
   * @param {string} excName
   * @param {object} conObj
   * {
   *  symbol,
   *  side,
   *  type,
   *  orderAmount,
   *  price,
   *  stopPrice,
   *  limitPrice,
   * }
   */
  constructor(excObj, excName, conObj) {
    super(excObj, excName, conObj);
    this.ocoOrder = new CreateOcoOrder(excObj, excName, conObj);
  }
  /**
   * Write order response data to database
   * @param {object} inObj Input object
   */
  processOrderResponse(inObj) {
    try {
      this.traderLog.info(`Processing ${this.orderResponse.type} order response...`);
      const dataObj = {
        eventTime: this.orderResponse.datetime,
        updateTime: this.orderResponse.info.updateTime ? new Date(Number(this.orderResponse.info.updateTime)).toISOString(): null,
        orderId: this.orderResponse.id,
        symbol: this.orderResponse.info.symbol,
        orderType: this.orderResponse.type,
        side: this.orderResponse.side,
        price: this.orderResponse.price,
        stopPrice: this.orderResponse.stopPrice,
        amount: this.orderResponse.amount,
        cost: this.orderResponse.cost,
        filled: this.orderResponse.filled,
        remaining: this.orderResponse.remaining,
        timeInForce: this.orderResponse.timeInForce,
        postOnly: this.orderResponse.postOnly,
        reduceOnly: this.orderResponse.reduceOnly,
        priceProtect: this.orderResponse.info.priceProtect,
        workingType: this.orderResponse.info.workingType,
        positionSide: this.orderResponse.info.positionSide,
        orderStatus: this.orderResponse.status,
        tradeStatus: this.orderResponse.info.status,
        exchange: this.exchangeName,
        oco: false,
        ocoLimitId: !inObj ? null : inObj.ocoLimitId,
        ocoStopLossLimitId: !inObj ? null : inObj.ocoStopLossLimitId,
        parentOrderId: this.orderResponse.parentOrderId ? this.orderResponse.parentOrderId : null,
        siblingOrderId: this.orderResponse.siblingOrderId ? this.orderResponse.siblingOrderId : null,
      };
      if (typeof this.orderResponse.fee === 'undefined') {
        dataObj.fee = null;
      } else {
        dataObj.fee = this.orderResponse.fee.cost * this.orderResponse.price; // convert fee to USD
      }

      super.writeToDatabase(dataObj);
      this.traderLog.info('Order response has been processed');
    } catch (error) {
      this.traderLog.error(`Failed to write order response to database. ${error.stack}`);
    }
  }
  /**
  * Creates the order with it's corresponding OCO order and then writes the response to the database.
  * @param {object} param Optional order parameters
  */
  async createOrder() {
    this.traderLog.info(`New order. Symbol: ${this.symbol}, Side: ${this.side}, Type: ${this.type} Amount: ${this.orderAmount}, Price: ${this.price}`);
    let ocoId;

    switch (this.type) {
      case 'market':
        try {
          this.orderResponse = await this.exchangeObj.createOrder(
              this.symbol,
              this.type,
              this.side,
              this.orderAmount,
              this.price,
          );
          this.traderLog.info(`New order has been created on ${this.exchangeName} with ID: ${this.orderResponse.id}.`);
          this.ocoOrder.parentOrderId = this.orderResponse.id;
          this.processOrderResponse();

          if ((this.exchangeName === 'binanceSpot' ||
          this.exchangeName === 'binanceSpotTest') &&
          this.side === 'buy') {
            try {
              ocoId = await this.ocoOrder.createOrder();
            } catch (error) {
              this.traderLog.error(`Oco order creation failed on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`);
            }

            this.processOrderResponse(ocoId);
          } else {
            const side = this.side === 'buy' ? 'sell' : 'buy';
            let stopMarketResponse;
            let takeProfitMarketResponse;

            try {
              this.traderLog.info(`Creating stop market / take profit market order pairs on ${this.exchangeName} for order: ${this.orderResponse.id}`);
              stopMarketResponse = await this.exchangeObj.createOrder(
                  this.symbol,
                  'stop_market',
                  side,
                  this.orderAmount,
                  this.price,
                  {stopPrice: this.stopPrice},
              );
              stopMarketResponse.parentOrderId = this.orderResponse.id;
              this.traderLog.info(`Stop market order has been created with ID: ${stopMarketResponse.id} on ${this.exchangeName} for order ${this.orderResponse.id}`);
            } catch (error) {
              this.traderLog.error(`Stop market order could not be created on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`);
            }

            try {
              takeProfitMarketResponse = await this.exchangeObj.createOrder(
                  this.symbol,
                  'take_profit_market',
                  side,
                  this.orderAmount,
                  this.price,
                  {stopPrice: this.limitPrice},
              );
              takeProfitMarketResponse.parentOrderId = this.orderResponse.id;
              this.traderLog.info(`Take profit market order has been created with ID: ${takeProfitMarketResponse.id} on ${this.exchangeName} for order ${this.orderResponse.id}`);
            } catch (error) {
              this.traderLog.error(`Take profit order could not be created on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`);
            }

            if (stopMarketResponse && takeProfitMarketResponse) {
              stopMarketResponse.siblingOrderId = takeProfitMarketResponse.id;
              takeProfitMarketResponse.siblingOrderId = stopMarketResponse.id;
            };

            if (stopMarketResponse) {
              this.orderResponse = stopMarketResponse;
              this.processOrderResponse();
            }
            if (takeProfitMarketResponse) {
              this.orderResponse = takeProfitMarketResponse;
              this.processOrderResponse();
            }
          }
        } catch (error) {
          this.traderLog.error(`Order creation failed. ${error.stack}`);
        }


        break;

      default:
        break;
    }
  }
}

module.exports = {
  CreateOrder,
};
