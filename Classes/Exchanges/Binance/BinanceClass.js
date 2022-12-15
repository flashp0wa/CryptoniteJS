const ccxt = require('ccxt');
const {CreateMarketBuyOrder} = require('./Order/CreateMarketBuyOrderClass');
const {CreateLimitBuyOrder} = require('./Order/CreateLimitBuyOrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {selectColumnsFrom, sproc_AddSymbolToDatabase, sproc_UpdateOrderSell, sproc_UpdateOrderBuy} = require('../../../DatabaseConnection/SQLConnector');
// const [downloadHistoryData] = require('../../../Toolkit/BncHistoryDownload');

// Later on this should be the base class for spot and futures trading (just take out the configure exchange part to a separate class)

class BinanceClass {
  constructor() {
    this.exchangeObj = this.configureExchange();
    this.markets;
    this.symbolList = [];
  }
  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   * @return {object} Binance CCXT Object
   */
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
  /**
   * Loads current open orders from the database and checks it's states fetching binance. If state changed updates database.
   */
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
  /**
   * Loads CCXT exchange market data
   */
  async loadMarkets() {
    ApplicationLog.info('Loading binance markets...');
    try {
      this.markets = await this.exchangeObj.loadMarkets();
    } catch (error) {
      ApplicationLog.error(`Loading binance market data failed...${error.stack}`);
    }
  }
  /**
   * Loads symbols available on the exchange
   */
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
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createMarketBuyOrder(conObj) {
    new CreateMarketBuyOrder(this.exchangeObj, conObj).createOrder();
  }
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createLimitBuyOrder(conObj) {
    new CreateLimitBuyOrder(this.exchangeObj, conObj).createOrder();
  }
}

module.exports = {
  BinanceClass,
};
