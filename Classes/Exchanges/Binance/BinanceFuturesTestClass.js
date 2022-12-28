const ccxt = require('ccxt');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {BinanceClass} = require('./BinanceClass');

class BinanceFuturesTestClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.configureExchange();
  }

  configureExchange() {
    ApplicationLog.info(`Loading ${this.exchangeName}...`);
    const binance = new ccxt.pro.binanceusdm;
    binance.apiKey = process.env.BNCFT_APIKEY;
    binance.secret = process.env.BNCFT_SECKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-futures-test';
    this.exchangeObj = binance;
  }
}
module.exports = {
  BinanceFuturesTestClass,
};
