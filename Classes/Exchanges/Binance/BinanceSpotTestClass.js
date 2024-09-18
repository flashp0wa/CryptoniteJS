const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');
const {WebSocketClient} = require('../../WebSocketClient');
const {createHash} = require('crypto');

class BinanceSpotTestClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.wssBaseUrl = process.env.BINANCE_SPOT_WSS_URL;
  }
  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   */
  async configure() {
    const binance = new ccxt.pro.binance();
    binance.apiKey = process.env.BINANCE_SPOTTEST_APIKEY;
    binance.secret = process.env.BINANCE_SPOTTEST_SECRETKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-test';
    this.excObj = binance;
    await super.loadExchange();
    this.webSocketClient = new WebSocketClient({
      userDataStreamUrl: `${process.env.BINANCE_SPOTTEST_USER_DATASTREAM_URL}?timestamp=${new Date().getTime()}&signature=${
        createHash('sha256').update(process.env.BINANCE_SPOTTEST_SECRETKEY).digest('hex')
      }`,
      apiKey: process.env.BINANCE_SPOTTEST_APIKEY,
      wssBaseUrl: this.wssBaseUrl,
      wssUrl: await super.buildWebSocketStreamUrl(this.wssBaseUrl),
      exchange: this.excName,
      excObj: this.excObj,
    });
  }
}
module.exports = {
  BinanceSpotTestClass,
};
