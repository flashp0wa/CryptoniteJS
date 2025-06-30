const ccxt = require('ccxt');
const {BinanceClass} = require('./BinanceClass');
const {WebSocketClient} = require('../../WebSocketClient');
const {createHash} = require('crypto');


class BinanceFuturesTestClass extends BinanceClass {
  constructor(excName) {
    super(excName);
    this.wssBaseUrl = process.env.BINANCE_FUTURESTEST_WSS_URL;
  }

  async configure() {
    const binance = new ccxt.pro.binanceusdm;
    binance.apiKey = process.env.BINANCE_FUTURES_APIKEY;
    binance.secret = process.env.BINANCE_FUTURES_SECRETKEY;
    binance.options.adjustForTimeDifference = true;
    binance.options['warnOnFetchOpenOrdersWithoutSymbol'] = false; // Call all open orders only 1 / 10 seconds
    binance.set_sandbox_mode(true);
    binance.name = 'binance-futures-test';
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
        excObjId: this.excObjId,
      });
    }
  }
}
module.exports = {
  BinanceFuturesTestClass,
};
