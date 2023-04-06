const {ApplicationLog} = require('../../Toolkit/Logger');
const {BinanceFuturesTestClass} = require('./Binance/BinanceFuturesTestClass');
const {BinanceSpotClass} = require('./Binance/BinanceSpotClass');
const {BinanceSpotTestClass} = require('./Binance/BinanceSpotTestClass');
const {BinanceFuturesClass} = require('./Binance/BinanceFuturesClass');

class Exchanges {
  constructor() {
    this.binance = new BinanceSpotClass('binance');
    this.binanceSpotTest = new BinanceSpotTestClass('binanceSpotTest');
    this.binanceFutures = new BinanceFuturesClass('binanceFutures');
    this.binanceFuturesTest = new BinanceFuturesTestClass('binanceFuturesTest');
  }

  /**
   * Load all exchange's market data
   */
  async loadExchanges() {
    for (const exchange of Object.keys(getExchanges())) {
      try {
        ApplicationLog.log({
          level: 'info',
          message: `Loading ${exchange}...`,
          senderFunction: 'loadExchanges',
          file: 'ExchangesClass.js',
        });
        await this[exchange].loadExchange();
      } catch (error) {
        ApplicationLog.log({
          level: 'error',
          message: `Error while loading ${exchange}. ${error}`,
          senderFunction: 'configureExchange',
          file: 'ExchangesClass.js',
          discord: 'application-errors',
        });
      }
    }
  }
  /**
   * Check all exchange's order status
   */
  checkOrderStatus() {
    for (const exchange of Object.keys(getExchanges())) {
      this[exchange].openOrders.checkOrderStatus();
    }
  }
  /**
   * Check all exchange's support order status
   */
  checkSupportOrderStatus() {
    for (const exchange of Object.keys(getExchanges())) {
      this[exchange].openOrders.checkSupportOrder();
    }
  }
  /**
   * Reload all exchange's market data
   */
  async reloadMarkets() {
    for (const exchange of Object.keys(getExchanges())) {
      try {
        await this[exchange].loadMarkets();
      } catch (error) {
        ApplicationLog.log({
          level: 'error',
          message: `Error while reloading market on ${exchange}. ${error}`,
          senderFunction: 'reloadMarkets',
          file: 'ExchangesClass.js',
          discord: 'application-errors',
        });
      }
    }
  }
}


let exchanges = new Exchanges();
/**
 * Creates the Exchanges class if does not exists and returns it. If already exists returns it.
 * @return {class} Exchanges class object
 */
function getExchanges() {
  if (!exchanges) {
    return exchanges = new Exchanges();
  } else {
    return exchanges;
  }
}

module.exports = {
  Exchanges,
  getExchanges,
};
