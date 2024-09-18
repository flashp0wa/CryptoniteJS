const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');
const {WebSocketClient} = require('../../WebSocketClient');


class BinanceSpotClass extends BinanceClass {
  constructor(exchangeName) {
    super(exchangeName);
    this.wssBaseUrl = process.env.BINANCE_SPOT_WSS_URL;
  }
  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   */
  async configure() {
    const binance = new ccxt.pro.binance();
    binance.apiKey = process.env.BINANCE_SPOT_APIKEY;
    binance.secret = process.env.BINANCE_SPOT_SECRETKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    this.excObj = binance;
    await super.loadExchange();
    this.webSocketClient = new WebSocketClient({
      userDataStreamApiUrl: process.env.BINANCE_SPOT_USER_DATASTREAM_URL,
      apiKey: process.env.BINANCE_SPOT_APIKEY,
      wssBaseUrl: this.wssBaseUrl,
      wssUrl: await super.buildWebSocketStreamUrl(this.wssBaseUrl),
      exchange: this.excName,
      excObj: this.excObj,
    }).startWebSocketStream();
  }
}

module.exports = {
  BinanceSpotClass,
};
