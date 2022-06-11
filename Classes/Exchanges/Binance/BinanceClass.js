const ccxt = require('ccxt');
const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass.js');
const {ApplicationLog} = require('../../../Toolkit/Logger.js');
const {selectColumnsFrom, updateTable} = require('../../../DatabaseConnection/SQLConnector');


class BinanceClass {
  constructor() {
    this.exchangeObj = this.configureExchange();
    this.markets;
  }

  configureExchange() {
    ApplicationLog.info('Loading binance...');
    const exchangeName = 'binance';
    const binance = new ccxt[exchangeName]();
    binance.apiKey = process.env.BNC_APIKEY;
    binance.secret = process.env.BNC_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    return binance;
  }

  async checkOrderStatus() {
    try {
      const buyOrders = await selectColumnsFrom('cry_order_buy', 'orderId, symbol', 'orderStatus=\'open\' AND exchange=\'binance\'');
      const sellOrders = await selectColumnsFrom('cry_order_sell', 'orderId, symbol', 'orderStatus=\'open\' AND exchange=\'binance\'');
      for (const order of sellOrders) {
        const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
        if (res.status === 'closed') {
          updateTable(
              'cry_order_sell', `fee=${res.fee}, filled=${res.filled}, cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
          );
        }
        if (res.status === 'canceled') {
          updateTable(
              'cry_order_sell', `orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
          );
        }
      }
      for (const order of buyOrders) {
        const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
        if (res.status !== 'open') {
          updateTable(
              'cry_order_buy', `fee=${res.fee}, cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
          );
        }
      }
    } catch (error) {
      ApplicationLog.error(`Error while checking order status: ${error.stack}`);
    }
  }

  async loadMarkets() {
    ApplicationLog.info('Loading binance markets...');
    try {
      this.markets = await this.exchangeObj.loadMarkets();
    } catch (error) {
      ApplicationLog.error(`Loading binance market data failed...${error.stack}`);
    }
  }

  createMarketBuyOrder(conObj) {
    new CreateMarketBuyOrder(this.exchangeObj, conObj).createOrder();
  }
}

module.exports = {
  BinanceClass,
};
