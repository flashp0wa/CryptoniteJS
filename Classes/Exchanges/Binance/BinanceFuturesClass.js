const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');

class BinanceFuturesClass extends BinanceClass {
  constructor(excName) {
    super(excName);
    this.configureExchange();
  }

  configureExchange() {
    const binance = new ccxt.pro.binanceusdm;
    binance.apiKey = process.env.BNC_APIKEY;
    binance.secret = process.env.BNC_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.name = 'binance-futures';
    this.excObj = binance;
  }
}
module.exports = {
  BinanceFuturesClass,
};
