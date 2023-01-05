const {singleRead, sproc_UpdateOrder} = require('../../../../DatabaseConnection/SQLConnector');
const {ApplicationLog} = require('../../../../Toolkit/Logger');
class OpenOrder {
  constructor(exchangeObj, exchangeName) {
    this.exchangeObj = exchangeObj;
    this.exchangeName = exchangeName;
    this.openOrders; // Array of objects
  }
  /**
   * Loads current open orders from the database and checks it's states fetching binance. If state changed updates database.
   */
  async checkOrderStatus() {
    try {
      ApplicationLog.log({
        level: 'info',
        message: `Checking order status on ${this.exchangeName}...`,
        senderFunction: 'checkOrderStatus',
        file: 'OpenOrderClass.js',
      });
      this.openOrders = await singleRead(`select * from itvf_ReturnOrders('open', ${this.exchangeObj.id})`);
      for (const order of this.openOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if ((res.status === 'closed' || res.status === 'canceled') && order.oco === false) {
            if (order.siblingOrderId && res.status === 'closed') {
              ApplicationLog.log({
                level: 'info',
                message: `Order ${order.orderId} has been closed, canceling sibling order ${order.siblingOrderId}`,
                senderFunction: 'checkOrderStatus',
                file: 'OpenOrderClass.js',
              });
              try {
                await this.exchangeObj.cancelOrder(order.siblingOrderId, order.symbol);
                ApplicationLog.log({
                  level: 'info',
                  message: `Sibling order ${order.siblingOrderId} has been canceled`,
                  senderFunction: 'checkOrderStatus',
                  file: 'OpenOrderClass.js',
                });
              } catch (error) {
                ApplicationLog.log({
                  level: 'error',
                  message: `Could not cancel sibling order ${order.siblingOrderId}. ${error}`,
                  senderFunction: 'checkOrderStatus',
                  file: 'OpenOrderClass.js',
                  discord: 'application-errors',
                });
              }
            }
            sproc_UpdateOrder({
              filled: res.filled,
              cost: res.cost,
              orderStatus: res.status,
              tradeStatus: res.info.status,
              orderId: Number(order.orderId),
              fee: !res.fee ? null : res.fee,
              exchangeId: this.exchangeObj.id,
              updateTime: new Date(Number(res.info.updateTime)).toISOString(),
            });
          }
        } catch (error) {
          ApplicationLog.log({
            level: 'error',
            message: `Could not fetch open orders on ${this.exchangeName} to check trade status. ${error.stack}`,
            senderFunction: 'checkOrderStatus',
            file: 'OpenOrderClass.js',
            discord: 'application-errors',
          });
        }
      }
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Error while checking order status on ${this.exchangeName}: ${error.stack}`,
        senderFunction: 'checkOrderStatus',
        file: 'OpenOrderClass.js',
        discord: 'application-error',
      });
    }
    ApplicationLog.log({
      level: 'info',
      message: `Order status check finished on ${this.exchangeName}`,
      senderFunction: 'checkOrderStatus',
      file: 'OpenOrderClass.js',
    });
  }
}

module.exports = {
  OpenOrder,
};
