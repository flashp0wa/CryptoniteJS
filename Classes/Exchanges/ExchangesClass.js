const {BinanceClass} = require('./Binance/BinanceClass.js');
const {BinanceTestClass} = require('./Binance/BinanceTestClass.js');

class Exchanges {
  constructor() {
    this.binance = new BinanceClass();
    this.binanceTest = new BinanceTestClass();
  }

  async loadAllMarkets() {
    await this.binance.loadMarkets();
    await this.binanceTest.loadMarkets();
    this.binance.loadSymbols();
    this.binanceTest.loadSymbols();
  }

  checkOrderStatus() {
    this.binance.checkOrderStatus();
    this.binanceTest.checkOrderStatus();
  }
}

let exchanges = new Exchanges();
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
