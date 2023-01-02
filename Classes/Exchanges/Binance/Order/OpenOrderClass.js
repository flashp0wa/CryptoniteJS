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
      ApplicationLog.silly(`Checking order status on ${this.exchangeName}...`);
      this.openOrders = await singleRead(`select * from itvf_ReturnOrders('open', ${this.exchangeObj.id})`);
      for (const order of this.openOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if ((res.status === 'closed' || res.status === 'canceled') && order.oco === false) {
            if (order.siblingOrderId && res.status === 'closed') {
              ApplicationLog.silly(`Order ${order.orderId} has been closed, canceling sibling order ${order.siblingOrderId}`);
              try {
                await this.exchangeObj.cancelOrder(order.siblingOrderId, order.symbol);
                ApplicationLog.silly(`Sibling order ${order.siblingOrderId} has been canceled`);
              } catch (error) {
                ApplicationLog.error(`Could not cancel sibling order ${order.siblingOrderId}. ${error}`);
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
          ApplicationLog.error(`Could not fetch open orders on ${this.exchangeName} to check trade status. ${error.stack}`);
        }
      }
    } catch (error) {
      ApplicationLog.error(`Error while checking order status on ${this.exchangeName}: ${error.stack}`);
    }
    ApplicationLog.silly(`Order status check finished on ${this.exchangeName}`);
  }
}

module.exports = {
  OpenOrder,
};
