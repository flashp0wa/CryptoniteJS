const ccxt = require('ccxt');
const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass');
const {CreateLimitBuyOrder} = require('./Order/CreateLimitBuyOrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {selectColumnsFrom, sproc_AddSymbolToDatabase, sproc_UpdateOrderSell} = require('../../../DatabaseConnection/SQLConnector');
// const [downloadHistoryData] = require('../../../Toolkit/BncHistoryDownload');


class BinanceClass {
  constructor() {
    this.exchangeObj = this.configureExchange();
    this.markets;
    this.symbolList = [];
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
      const buyOrders = await selectColumnsFrom('cry_order_buy', 'orderId, symbolId', 'orderStatus = \'open\' AND exchangeId = 1');
      const sellOrders = await selectColumnsFrom('cry_order_sell', 'orderId, symbolId', 'orderStatus = \'open\' AND exchangeId = 1');
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
    ApplicationLog.info('Loading binance markets...');
    try {
      this.markets = await this.exchangeObj.loadMarkets();
    } catch (error) {
      ApplicationLog.error(`Loading binance market data failed...${error.stack}`);
    }
  }

  loadSymbols() {
    try {
      if (this.symbolList.length !== 0) {
        this.symbolList = [];
      }
      for (const market of Object.keys(this.markets)) {
        const actualSymbol = this.markets[market].info.symbol;
        this.symbolList.push(actualSymbol);
        sproc_AddSymbolToDatabase(actualSymbol, 1);
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
}

module.exports = {
  BinanceClass,
};
