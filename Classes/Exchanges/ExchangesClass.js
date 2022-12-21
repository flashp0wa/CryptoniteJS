const {BinanceSpotClass} = require('./Binance/BinanceSpotClass.js');
const {BinanceTestClass} = require('./Binance/BinanceTestClass.js');

class Exchanges {
  constructor() {
    this.binance = new BinanceSpotClass('binance');
    this.binanceTest = new BinanceTestClass('binanceTest');
  }

  /**
   * Load all exchange's market data
   */
  async loadAllMarkets() {
    await this.binance.loadMarkets();
    await this.binanceTest.loadMarkets();
    this.binance.loadSymbols();
    this.binanceTest.loadSymbols();
  }

  /**
   * Check all exchange's order status
   */
  checkOrderStatus() {
    this.binance.checkOrderStatus();
    this.binanceTest.checkOrderStatus();
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
