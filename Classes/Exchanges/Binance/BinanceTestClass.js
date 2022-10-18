const ccxt = require('ccxt');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass');
const {CreateLimitBuyOrder} = require('./Order/CreateLimitBuyOrderClass');
const {selectColumnsFrom, sproc_UpdateOrderBuy, sproc_UpdateOrderSell} = require('../../../DatabaseConnection/SQLConnector');

class BinanceTestClass {
  constructor() {
    this.exchangeObj = this.configureExchange();
    this.markets;
    this.symbolList = [];
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
      const buyOrders = await selectColumnsFrom('cry_order_buy', 'orderId, symbolId', 'orderStatus = \'open\' AND exchangeId = 2');
      const sellOrders = await selectColumnsFrom('cry_order_sell', 'orderId, symbolId', 'orderStatus = \'open\' AND exchangeId = 2');
      for (const order of sellOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'closed') {
            if (!res.fee) {
              sproc_UpdateOrderSell({
                filled: res.filled,
                cost: res.cost,
                orderStatus: res.orderStatus,
                tradeStatus: res.tradeStatus,
                orderId: res.orderId,
              });
            }
          }
          if (res.status === 'canceled') {
            sproc_UpdateOrderSell({
              orderStatus: res.orderStatus,
              tradeStatus: res.tradeStatus,
              orderId: res.orderId,
            });
          }
        } catch (error) {
          ApplicationLog.error(`Could not fetch orders to check trade status. ${error.stack}`);
        }
      }
      for (const order of buyOrders) {
        try {
          const res = await this.exchangeObj.fetchOrder(order.orderId, order.symbol);
          if (res.status === 'canceled' || res.status === 'closed') {
            sproc_UpdateOrderBuy({
              orderStatus: res.status,
              tradeStatus: res.info.status,
              orderId: res.orderId,
              fee: res.fee,
              cost: res.cost,
            });
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

  loadSymbols() {
    if (this.symbolList.length !== 0) {
      this.symbolList = [];
    }
    try {
      for (const market of Object.keys(this.markets)) {
        this.symbolList.push(this.markets[market].info.symbol);
      }
    } catch (error) {
      ApplicationLog.warn(`Loading symbols failed...${error.stack}`);
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
