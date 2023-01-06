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
      this.traderLog.log({
        level: 'info',
        message: `Processing ${this.orderType.type} order response`,
        senderFunction: 'processOrderResponse',
        file: 'createOrderClass.js',
      });
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
        strategy: this.strategy,
      };
      if (typeof this.orderResponse.fee === 'undefined') {
        dataObj.fee = null;
      } else {
        dataObj.fee = this.orderResponse.fee.cost * this.orderResponse.price; // convert fee to USD
      }

      this.traderLog.log({
        level: 'info',
        message: 'NEW ORDER',
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
        obj: dataObj,
        discord: 'successful-orders',
      });

      super.writeToDatabase(dataObj);
      this.traderLog.log({
        level: 'info',
        message: 'Order response has been processed',
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Failed to write order response to database. ${error}`,
        senderFunction: 'processOrderResponse',
        file: 'CreateOrderClass.js',
        discord: 'application-errors',
      });
    }
  }
  /**
  * Creates the order with it's corresponding OCO order and then writes the response to the database.
  * @param {object} param Optional order parameters
  */
  async createOrder() {
    if (process.env.CRYPTONITE_TRADE_MODE === 'Paper') {
      
    } else {
      this.traderLog.log({
        level: 'info',
        message: `
        New order
        Symbol: ${this.symbol}
        Side: ${this.side},
        Type: ${this.type}
        Amount: ${this.orderAmount}
        Price: ${this.price}`,
        senderFunction: 'createOrder',
        file: 'CreateOrderClass.js',
      });
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
            this.traderLog.log({
              level: 'info',
              message: `New order has been created on ${this.exchangeName} with ID: ${this.orderResponse.id}.`,
              senderFunction: 'createOrder',
              file: 'CreateOrderClass.js',
            });

            this.ocoOrder.parentOrderId = this.orderResponse.id;
            this.processOrderResponse();

            if ((this.exchangeName === 'binanceSpot' ||
            this.exchangeName === 'binanceSpotTest') &&
            this.side === 'buy') {
              try {
                ocoId = await this.ocoOrder.createOrder();
              } catch (error) {
                this.traderLog.log({
                  level: 'error',
                  message: `Oco order creation failed on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                  discord: 'failed-orders',
                });
              }

              this.processOrderResponse(ocoId);
            } else {
              const side = this.side === 'buy' ? 'sell' : 'buy';
              let stopMarketResponse;
              let takeProfitMarketResponse;

              try {
                this.traderLog.log({
                  level: 'info',
                  message: `Creating stop market / take profit market order pairs on ${this.exchangeName} for order: ${this.orderResponse.id}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                });

                stopMarketResponse = await this.exchangeObj.createOrder(
                    this.symbol,
                    'stop_market',
                    side,
                    this.orderAmount,
                    this.price,
                    {stopPrice: this.stopPrice},
                );
                stopMarketResponse.parentOrderId = this.orderResponse.id;
                this.traderLog.log({
                  level: 'info',
                  message: `Stop market order has been created with ID: ${stopMarketResponse.id} on ${this.exchangeName} for order ${this.orderResponse.id}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                });
              } catch (error) {
                this.traderLog.log({
                  level: 'error',
                  message: `Stop market order could not be created on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                  discord: 'failed-orders',
                });
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
                this.traderLog.log({
                  level: 'info',
                  message: `Take profit market order has been created with ID: ${takeProfitMarketResponse.id} on ${this.exchangeName} for order ${this.orderResponse.id}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                });
              } catch (error) {
                this.traderLog.log({
                  level: 'error',
                  message: `Take profit order could not be created on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`,
                  senderFunction: 'createOrder',
                  file: 'CreateOrderClass.js',
                  discord: 'failed-orders',
                });
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
            this.traderLog.log({
              level: 'error',
              message: `Market order creation failed. ${error}`,
              senderFunction: 'createOrder',
              file: 'CreateOrderClass.js',
              discord: 'failed-orders',
            });
          }

          break;

        default:
          break;
      }
    }
  }
}

module.exports = {
  CreateOrder,
};
