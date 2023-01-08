const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');

class BinanceSpotClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.configureExchange();
  }

  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   */
  configureExchange() {
    const binance = new ccxt.pro.binance();
    binance.apiKey = process.env.BNC_APIKEY;
    binance.secret = process.env.BNC_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    this.excObj = binance;
  }
}

module.exports = {
  BinanceSpotClass,
};
