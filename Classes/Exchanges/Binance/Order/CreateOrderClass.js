const {Order} = require('./OrderClass');
const {CreateOcoOrder} = require('./CreateOcoOrder');
const CreateStopLossOrder = require('./CreateStopLossOrderClass');
const CreateTakeProfitOrder = require('./CreateTakeProfitClass');


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
   *  strategy,
   * }
   */
  constructor(excObj, excName, conObj) {
    super(excObj, excName, conObj);
    this.ocoOrder = new CreateOcoOrder(excObj, excName, conObj);
    this.stopLossOrder = new CreateStopLossOrder(excObj, excName, conObj);
    this.takeProfitOrder = new CreateTakeProfitOrder(excObj, excName, conObj);
    this.waitingForFill = this.type === 'market' ? false : true;
  }

  /**
  * Creates the order with it's corresponding OCO order and then writes the response to the database.
  * @param {object} param Optional order parameters
  */
  async createOrder() {
    if (this.tradeMode === 'Paper') {
      super.writeToDatabase(this.conObj);
    } else {
      this.traderLog.log({
        level: 'info',
        message: `
        NEW ORDER
        Symbol: ${this.symbol}
        Side: ${this.side},
        Type: ${this.type}
        Amount: ${this.orderAmount}
        Price: ${this.price}
        Stop: ${this.stopPrice}
        Limit: ${this.limitPrice}`,
        senderFunction: 'createOrder',
        file: 'CreateOrderClass.js',
      });

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
          message: `New ${this.type} order has been created on ${this.exchangeName} with ID: ${this.orderResponse.id}.`,
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
        });

        if ((this.exchangeName === 'binanceSpot' ||
            this.exchangeName === 'binanceSpotTest') &&
            this.side === 'buy') {
          try {
            const ocoId = await this.ocoOrder.createOrder();
            this.ocoOrder.parentOrderId = this.orderResponse.id;
            super.processOrderResponse(ocoId);
          } catch (error) {
            this.traderLog.log({
              level: 'error',
              message: `Oco order creation failed on ${this.exchangeName} for order ${this.orderResponse.id}. ${error}`,
              senderFunction: 'createOrder',
              file: 'CreateOrderClass.js',
              discord: 'failed-orders',
            });
          }
        } else {
          super.processOrderResponse();
          this.stopLossOrder.parentOrderId = this.orderResponse.id;
          this.takeProfitOrder.parentOrderId = this.orderResponse.id;
          this.traderLog.log({
            level: 'info',
            message: `Creating stoploss / take profit order pairs on ${this.exchangeName} for order: ${this.orderResponse.id}`,
            senderFunction: 'createOrder',
            file: 'CreateOrderClass.js',
          });
          if (this.waitingForFill) {
            this.traderLog.log({
              level: 'info',
              message: `Waiting for order to fill on ${this.exchangeName} for order: ${this.orderResponse.id}`,
              senderFunction: 'createOrder',
              file: 'CreateOrderClass.js',
            });
            this.db.sproc_InsertIntoSystemStateSupportOrder({
              symbolName: this.symbol,
              exchangeName: this.exchangeName,
              orderSideName: this.side,
              orderTypeName: this.type,
              strategyName: this.strategy,
              orderAmount: this.orderAmount,
              orderPrice: this.price,
              stopPrice: this.stopPrice,
              limitPrice: this.limitPrice,
              orderId: this.orderResponse.id,
              timeFrame: this.timeFrame,
            });
          } else {
            this.supportOrder();
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
    }
  }

  async supportOrder() {
    if (this.isReOpen) {
      this.stopLossOrder.parentOrderId = this.orderId;
      this.takeProfitOrder.parentOrderId = this.orderId;
    }
    const id1 = await this.stopLossOrder.createOrder();
    const id2 = await this.takeProfitOrder.createOrder();
    this.stopLossOrder.siblingOrderId = id2;
    this.takeProfitOrder.siblingOrderId = id1;
    this.stopLossOrder.processOrderResponse();
    this.takeProfitOrder.processOrderResponse();

    if (this.isReOpen) {
      this.db.sproc_DeleteFromSystemStateSupportOrder({orderId: this.orderId});
    }
  }
}

module.exports = {
  CreateOrder,
};
