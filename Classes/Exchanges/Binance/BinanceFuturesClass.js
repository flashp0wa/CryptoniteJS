const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');
const {createHash} = require('crypto');
const {WebSocketClient} = require('../../WebSocketClient');

class BinanceFuturesClass extends BinanceClass {
  constructor(excName) {
    super(excName);
    this.wssBaseUrl = process.env.BINANCE_FUTURES_WSS_URL;
  }
  /**
   * Configures the exchange object for use. Sets API key, secret key, adjust for time difference and warn on fetch open orders without symbol options.
   */
  async configure() {
    const binance = new ccxt.pro.binanceusdm;
    binance.apiKey = process.env.BINANCE_SPOT_APIKEY;
    binance.secret = process.env.BINANCE_SPOT_SECRETKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.name = 'binance-futures';
    this.excObj = binance;
    await super.loadExchange();
    if (this.isWebSocketEnabled) {
      this.webSocketClient = new WebSocketClient({
        userDataStreamApiUrl: `${process.env.BINANCE_FUTURES_USER_DATASTREAM_URL}?timestamp=${new Date().getTime()}&signature=${
          createHash('sha256').update(process.env.BINANCE_SPOT_SECRETKEY).digest('hex')
        }`,
        apiKey: process.env.BINANCE_SPOT_APIKEY,
        wssBaseUrl: this.wssBaseUrl,
        exchange: this.excName,
        excObjId: this.excObj.id,
      });
    }
  }
}


module.exports = {
  BinanceFuturesClass,
};
