const ccxt = require('ccxt');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {BinanceClass} = require('./BinanceClass');

class BinanceSpotTestClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.configureExchange();
  }
  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   */
  configureExchange() {
    ApplicationLog.log({
      level: 'info',
      message: `Loading ${this.exchangeName}`,
      senderFunction: 'configureExchange',
      file: 'BinanceSpotTestClass.js',
    });
    const binance = new ccxt.pro.binance();
    binance.apiKey = process.env.BNCT_APIKEY;
    binance.secret = process.env.BNCT_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-test';
    this.exchangeObj = binance;
  }
}
module.exports = {
  BinanceSpotTestClass,
};
