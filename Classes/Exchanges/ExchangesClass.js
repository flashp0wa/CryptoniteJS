const {BinanceFuturesTestClass} = require('./Binance/BinanceFuturesTestClass.js');
const {BinanceSpotClass} = require('./Binance/BinanceSpotClass.js');
const {BinanceSpotTestClass} = require('./Binance/BinanceSpotTestClass.js');

class Exchanges {
  constructor() {
    this.binance = new BinanceSpotClass('binance');
    this.binanceSpotTest = new BinanceSpotTestClass('binanceSpotTest');
    this.binanceFuturesTest = new BinanceFuturesTestClass('binanceFuturesTest');
  }

  /**
   * Load all exchange's market data
   */
  async loadExchanges() {
    for (const exchange of Object.keys(getExchanges())) {
      await this[exchange].loadExchange();
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
   * Reload all exchange's market data
   */
  async reloadMarkets() {
    for (const exchange of Object.keys(getExchanges())) {
      await this[exchange].loadMarkets();
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
