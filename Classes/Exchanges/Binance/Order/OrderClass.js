const {TraderLog} = require('../../../../Toolkit/Logger');
const {getDatabase} = require('../../../Database');


class Order {
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
    this.exchangeObj = excObj;
    this.exchangeName = excName;
    this.symbol = conObj.symbol;
    this.timeFrame = conObj.timeFrame;
    this.type = conObj.type;
    this.side = conObj.side;
    this.orderAmount = conObj.orderAmount ? this.exchangeObj.decimalToPrecision(conObj.orderAmount, 'ROUND', 2, 'DECIMAL_PLACES') : false;
    this.price = this.exchangeObj.priceToPrecision(this.symbol, conObj.price);
    this.limitPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.limitPrice);
    this.stopPrice = this.exchangeObj.priceToPrecision(this.symbol, conObj.stopPrice);
    this.stopLimitPrice = this.exchangeObj.priceToPrecision(this.symbol, (conObj.stopPrice - conObj.stopPrice * 0.01));
    this.traderLog = TraderLog;
    this.strategy = conObj.strategy;
    this.conObj = conObj;
    this.db = getDatabase();
    this.options;
  }

  /**
   * Write order response data to database
   * @param {object} inObj Input object
   */
  async databasePush() {
    this.traderLog.log({
      level: 'info',
      message: `Push position details to database`,
      senderFunction: 'databasePush',
      file: 'createOrderClass.js',
    });
    try {
      const dataObj = {
        exchange: this.exchangeName,
        symbol: this.symbol,
        timeFrame: this.timeFrame,
        type: this.type,
        side: this.side,
        orderAmount: this.orderAmount,
        price: this.price,
        limitPrice: this.limitPrice,
        stopPrice: this.stopPrice,
        stopLimitPrice: this.stopLimitPrice,
        strategy: this.strategy,
        isPostOnly: this.exchangeObj.isPostOnly,
        options: this.options,
      };

      const res = await this.db.pushJson(dataObj, 'NI _CreateOrder');

      this.traderLog.log({
        level: 'info',
        message: 'Database push succeeded',
        senderFunction: 'databasePush',
        file: 'OrderClass.js',
      });

      return res;
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Database push failed. ${error.stack}`,
        senderFunction: 'databasePush',
        file: 'OrderClass.js',
        discord: 'application-errors',
      });
    }
  }

  /**
  * Creates the order with it's corresponding OCO order and then writes the response to the database.
  * @param {object} param Optional order parameters
  */
  async createOrder() {
    this.traderLog.log({
      level: 'info',
      message: 'New position request',
      senderFunction: 'createOrder',
      file: 'CreateOrderClass.js',
    });
    const order = await super.databasePush();
    const options = {...order.entryOrder.options};

    try {
      await this.exchangeObj.createOrder(
          order.entryOrder.symbol,
          order.entryOrder.type,
          order.entryOrder.side,
          order.entryOrder.orderAmount,
          order.entryOrder.price,
          options,
      );

      this.traderLog.log({
        level: 'info',
        message: `New ${order.type} order has been created on ${this.exchangeName} with ID: ${options.listClientOrderId}.`,
        senderFunction: 'createOrder',
        file: 'CreateOrderClass.js',
      });
    } catch (error) {
      this.traderLog.log({
        level: 'error',
        message: `Market order creation failed. ${error}`,
        senderFunction: 'createOrder',
        file: 'CreateOrderClass.js',
        discord: 'failed-orders',
      });
    }

    if (order.oco) {
      try {
        this.traderLog.log({
          level: 'info',
          message: 'New OCO order',
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
        });

        await this.exchangeObj.privatePostOrderOco(order.oco);

        this.traderLog.log({
          level: 'info',
          message: 'OCO order has been created.',
          senderFunction: 'createOrder',
          file: 'CreateOcoOrder.js',
        });
      } catch (error) {
        this.traderLog.log({
          level: 'error',
          message: `OCO order creation failed. ${error}`,
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
          discord: 'failed-orders',
        });
      }
    } else {
      try {
        this.traderLog.log({
          level: 'info',
          message: 'New take profit order',
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
        });
        const options = {...order.takeProfit.options};
        await this.exchangeObj.createOrder(
            order.takeProfit.symbol,
            order.takeProfit.stopLossType,
            order.takeProfit.side,
            order.takeProfit.orderAmount,
            order.takeProfit.price,
            options,
        );
      } catch {
        this.traderLog.log({
          level: 'error',
          message: `Take profit order creation failed. ${error}`,
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
          discord: 'failed-orders',
        });
      }
      try {
        this.traderLog.log({
          level: 'info',
          message: 'New stop loss order',
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
        });
        const options = {...order.stopLoss.options};
        await this.exchangeObj.createOrder(
            order.stopLoss.symbol,
            order.stopLoss.stopLossType,
            order.stopLoss.side,
            order.stopLoss.orderAmount,
            order.stopLoss.price,
            options,
        );
      } catch {
        this.traderLog.log({
          level: 'error',
          message: `Stop loss order creation failed. ${error}`,
          senderFunction: 'createOrder',
          file: 'CreateOrderClass.js',
          discord: 'failed-orders',
        });
      }
    }
  }
}

module.exports = {
  Order,
};
