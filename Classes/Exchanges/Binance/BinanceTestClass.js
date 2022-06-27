const ccxt = require('ccxt');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass');
const {CreateLimitBuyOrder} = require('./Order/CreateLimitBuyOrderClass');
const {selectColumnsFrom, updateTable} = require('../../../DatabaseConnection/SQLConnector');

class BinanceTestClass {
  constructor() {
    this.exchangeObj = this.configureExchange();
    this.markets;
  }

  configureExchange() {
    ApplicationLog.info('Loading binance test...');
    const exchangeName = 'binance';
    const binance = new ccxt[exchangeName]();
    binance.apiKey = process.env.BNCT_APIKEY;
    binance.secret = process.env.BNCT_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-test';
    return binance;
  }

  async checkOrderStatus() {
    try {
      const buyOrders = await selectColumnsFrom('cry_order_buy', 'orderId, symbol', 'orderStatus=\'open\' AND exchange=\'binanceTest\'');
      const sellOrders = await selectColumnsFrom('cry_order_sell', 'orderId, symbol', 'orderStatus=\'open\' AND exchange=\'binanceTest\'');
      for (const order of sellOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'closed') {
            if (!res.fee) {
              updateTable(
                  'cry_order_sell', `filled=${res.filled}, cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
              );
            }
            updateTable(
                'cry_order_sell', `filled=${res.filled}, cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
            );
          }
          if (res.status === 'canceled') {
            updateTable(
                'cry_order_sell', `orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
            );
          }
        } catch (error) {
          ApplicationLog.error(`Could not fetch orders to check trade status. ${error.stack}`);
        }
      }
      for (const order of buyOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'canceled') {
            updateTable(
                'cry_order_buy', `orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
            );
          }
          if (res.status === 'closed') {
            if (!res.fee) {
              updateTable(
                  'cry_order_buy', `cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
              );
            }
            updateTable(
                'cry_order_buy', `fee=${res.fee}, cost='${res.cost}', orderStatus='${res.status}', tradeStatus='${res.info.status}'`, `orderId=${order.orderId}`,
            );
          }
        } catch (error) {
          ApplicationLog.error(`Could not fetch orders to check trade status. ${error.stack}`);
        }
      }
    } catch (error) {
      ApplicationLog.error(`Error while checking order status: ${error.stack}`);
    }
  }

  async loadMarkets() {
    try {
      ApplicationLog.info('Loading binance-test markets ...');
      this.markets = await this.exchangeObj.loadMarkets();
    } catch (error) {
      ApplicationLog.error(`Loading binance-test market data failed...${error.stack}`);
    }
  }

  createMarketBuyOrder(conObj) {
    new CreateMarketBuyOrder(this.exchangeObj, conObj).createOrder();
  }

  createLimitBuyOrder(conObj) {
    new CreateLimitBuyOrder(this.exchangeObj, conObj).createOrder();
  }
};


module.exports = {
  BinanceTestClass,
};
