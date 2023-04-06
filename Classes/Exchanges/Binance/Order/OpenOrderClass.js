const {returnEmitter} = require('../../../../Loaders/EventEmitter');
const {OpenOrderCheckLog} = require('../../../../Toolkit/Logger');
const {getDatabase} = require('../../../Database');

class OpenOrder {
  constructor(excObj, excName) {
    this.excObj = excObj;
    this.excName = excName;
    this.openOrders;
    this.db = getDatabase();
    this.globalEvent = returnEmitter(); // Global event object
  }

  /**
   * Loads current open orders from the database and checks it's states fetching binance. If state changed updates database.
   */
  async checkOrderStatus() {
    try {
      OpenOrderCheckLog.log({
        level: 'info',
        message: `Checking order status on ${this.excName}...`,
        senderFunction: 'checkOrderStatus',
        file: 'OpenOrderClass.js',
      });
      this.openOrders = await this.db.singleRead(`select * from itvf_ReturnOrders('open', ${this.excObj.id})`);
      for (const order of this.openOrders) {
        try {
          const res = await this.excObj.fetchOrderStatus(order.orderId, order.symbol);
          if ((res === 'closed' || res === 'canceled') && order.oco === false) {
            if (order.siblingOrderId && res === 'closed') {
              OpenOrderCheckLog.log({
                level: 'info',
                message: `Order ${order.orderId} has been closed, canceling sibling order ${order.siblingOrderId}`,
                senderFunction: 'checkOrderStatus',
                file: 'OpenOrderClass.js',
              });
              try {
                await this.excObj.cancelOrder(order.siblingOrderId, order.symbol);
                OpenOrderCheckLog.log({
                  level: 'info',
                  message: `Sibling order ${order.siblingOrderId} has been canceled`,
                  senderFunction: 'checkOrderStatus',
                  file: 'OpenOrderClass.js',
                });
              } catch (error) {
                OpenOrderCheckLog.log({
                  level: 'error',
                  message: `Could not cancel sibling order ${order.siblingOrderId}. ${error}`,
                  senderFunction: 'checkOrderStatus',
                  file: 'OpenOrderClass.js',
                  discord: 'application-errors',
                });
              }
            }
            this.db.sproc_UpdateOrder({
              filled: res.filled,
              cost: res.cost,
              orderStatus: res.status,
              tradeStatus: res.info.status,
              orderId: order.orderId,
              fee: !res.fee ? null : res.fee,
              exchangeId: this.excObj.id,
              updateTime: new Date(Number(res.info.updateTime)).toISOString(),
            });
          }
        } catch (error) {
          OpenOrderCheckLog.log({
            level: 'error',
            message: `Could not fetch open orders on ${this.excName} to check trade status. ${error}`,
            senderFunction: 'checkOrderStatus',
            file: 'OpenOrderClass.js',
            discord: 'application-errors',
          });
        }
      }
    } catch (error) {
      OpenOrderCheckLog.log({
        level: 'error',
        message: `Error while checking order status on ${this.excName}: ${error}`,
        senderFunction: 'checkOrderStatus',
        file: 'OpenOrderClass.js',
        discord: 'application-error',
      });
    }
    OpenOrderCheckLog.log({
      level: 'info',
      message: `Order status check finished on ${this.excName}`,
      senderFunction: 'checkOrderStatus',
      file: 'OpenOrderClass.js',
    });
  }

  async checkSupportOrder() {
    const supportOrders = await this.db.singleRead(`select * from itvf_ReturnSystemStateSupportOrder('${this.excName}')`);
    for (const order of supportOrders) {
      try {
        const res = await this.excObj.fetchOrderStatus(order.orderId, order.symbol);
        if (res === 'closed') {
          OpenOrderCheckLog.log({
            level: 'info',
            message: `Support order ${order.orderId} has been closed, creating new order`,
            senderFunction: 'checkSupportOrder',
            file: 'OpenOrderClass.js',
            discord: 'application-errors',
          });

          this.globalEvent.emit('CreateOrder', {
            symbol: order.symbol,
            side: order.orderSideName,
            type: order.orderTypeName,
            exchange: order.exchange,
            strategy: order.strategyName,
            orderAmount: order.orderAmount,
            price: order.price,
            stopPrice: order.stopPrice,
            limitPrice: order.limitPrice,
            reopen: true,
            orderId: order.orderId,
          });
        } else if (res === 'canceled') {
          this.db.sproc_DeleteFromSystemStateSupportOrder({orderId: order.orderId});
        }
      } catch (error) {
        OpenOrderCheckLog.log({
          level: 'error',
          message: `Could not fetch support order on ${this.excName} to check trade status. ${error}`,
          senderFunction: 'checkSupportOrder',
          file: 'OpenOrderClass.js',
          discord: 'application-errors',
        });
      }
    }
  }
}

module.exports = {
  OpenOrder,
};
