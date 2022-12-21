const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');

class BinanceSpotClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.exchangeObj = this.configureExchange();
  }

  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   * @return {object} Binance CCXT Object
   */
  configureExchange() {
    ApplicationLog.info('Loading binance...');
    const exchangeName = this.exchangeName;
    const binance = new ccxt[exchangeName]();
    binance.apiKey = process.env.BNC_APIKEY;
    binance.secret = process.env.BNC_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    return binance;
  }
}

module.exports = {
  BinanceSpotClass,
};
