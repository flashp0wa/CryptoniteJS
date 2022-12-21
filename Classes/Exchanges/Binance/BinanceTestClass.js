const ccxt = require('ccxt');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {BinanceClass} = require('./BinanceClass');

class BinanceTestClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.exchangeObj = this.configureExchange();
  }

  configureExchange() {
    ApplicationLog.info(`Loading ${this.exchangeName}...`);
    const exchangeName = 'binance'; // There is no separate class for test in CCXT
    const binance = new ccxt[exchangeName]();
    binance.apiKey = process.env.BNCT_APIKEY;
    binance.secret = process.env.BNCT_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-test';
    return binance;
  }
}
module.exports = {
  BinanceTestClass,
};
