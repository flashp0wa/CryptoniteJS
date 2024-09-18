const {Order} = require('./Order/OrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {getDatabase} = require('../../Database');


class BinanceClass {
  constructor(excName) {
    this.excName = excName;
    this.markets;
    this.symbolList = [];
    this.https://union-click.jd.com/jdc?e=jdext-1261348777639735296-0&p=AyIGZRhbHQsWAVIaXxEyEgRdG1sRBxU3EUQDS10iXhBeGlcJDBkNXg9JHUlSSkkFSRwSBF0bWxEHFRgMXgdIMkRxFAUJD1RQZT0cBnwKDE4%2BaDpgB2ILWStbHAIQD1QaWxIBIgdUGlsRBxEEUxprJQIXNwd1g6O0yqLkB4%2B%2FjcePwitaJQIWD1cfWhwKGwVSG1wlAhoDZc31gdeauIyr%2FsOovNLYq46cqca50ytrJQEiXABPElAeEgRSG1kQCxQBUxxZHQQQA1YTXAkDIgdUGlscChECXRs1FGwSD1UbWRALFwRWK1slASJZOxoLRlUXU1NONU9QEkdXWRlJbBUDVB9TFgAVN1caWhcAexcObj;
    this.strategy;
    this.db = getDatabase();
    this.isPostOnly = true;
    this.webSocketClient;
  }

  /**
   * Loads CCXT exchange market data
   */
  async loadMarkets() {
    ApplicationLog.log({
      level: 'info',
      message: `Loading ${this.excName} markets...`,
      senderFunction: 'loadMarkets',
      file: 'BinanceClass.js',
    });
    try {
      this.markets = await this.excObj.loadMarkets();
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Loading binance market data failed...${error.message}`,
        senderFunction: 'loadMarkets',
        file: 'BinanceClass.js',
        discord: 'application-error',
      });
    }
  }
  /**
   *
   * @return {int} Returns the exchange ID
   */
  async loadExchangeId() {
    try {
      ApplicationLog.log({
        level: 'info',
        message: `Loading exchange ID on ${this.excName}`,
        senderFunction: 'loadExchangeId',
        file: 'BinanceClass.js',
      });
      const response = await this.db.singleRead(`select * from itvf_GetExchangeId('${this.excName}')`);
      this.excObj.id = response[0].exchangeId;
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Could not load exchange ID. ${error.message}`,
        senderFunction: 'loadExchangeId',
        file: 'BinanceClass.js',
        discord: 'application-error',
      });
    }
  }
  /**
   * Loads symbols available on the exchange
   */
  // async loadSymbols() {
  //   try {
  //     ApplicationLog.log({
  //       level: 'info',
  //       message: `Loading symbols on ${this.excName}`,
  //       senderFunction: 'loadSymbols',
  //       file: 'BinanceClass.js',
  //     });
  //     if (this.symbolList.length !== 0) {
  //       this.symbolList = [];
  //     }
  //     for (const market of Object.keys(this.markets)) {
  //       const actualSymbol = this.markets[market].info.symbol;
  //       this.symbolList.push(actualSymbol);
  //       await this.db.sproc_AddSymbolToDatabase(actualSymbol, this.excObj.id);
  //     }

  //     ApplicationLog.log({
  //       level: 'info',
  //       message: `Symbols loaded on ${this.excName}`,
  //       senderFunction: 'loadSymbols',
  //       file: 'BinanceClass.js',
  //     });
  //   } catch (error) {
  //     ApplicationLog.log({
  //       level: 'warn',
  //       message: `Loading symbols failed on ${this.excName}. ${error}`,
  //       senderFunction: 'loadSymbols',
  //       file: 'BinanceClass.js',
  //     });
  //   }
  // }
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createOrder(conObj) {
    new Order(this.excObj, this.excName, conObj).createOrder();
  }
  async buildWebSocketStreamUrl(baseUrl) {
    try {
      let url;
      const rows = await this.db.singleRead(`select * from NI_itvf_GetWss(${this.excObj.id})`);
      if (rows.lenght === 0) return false;

      const streams = [];
      for (const row of rows) {
        streams.push(`${row.symbol.toLowerCase()}@${row.streamType}`);
      }

      if (streams.length === 1) {
        url = baseUrl + 'ws/' + streams;
      } else {
        url = `${baseUrl}stream?streams=`;
        for (let index = 0; index < streams.length; index++) {
          url += streams[index];
          // Do not place forward slash at the end of the URL
          if (streams.length !== index + 1) {
            url += '/';
          }
        }
      }
      ApplicationLog.log({
        level: 'info',
        message: 'WSS URL build succeeded',
        senderFunction: 'buildWebSocketStreamUrl',
        file: 'BinanceClass.js',
      });
      return url;
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `URL build failed. Stream URL: ${url}`,
        senderFunction: 'buildWebSocketStreamUrl',
        file: 'BinanceClass.js',
      });
    }
  }
  /**
   * Loads exchange data
   */
  async loadExchange() {
    try {
      await this.loadExchangeId();
      await this.loadMarkets();
      this.loadSymbols();
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Error while loading exchagnes. ${error}`,
        senderFunction: 'loadExchange',
        file: 'BinanceClass.js',
      });
    }
  }
}

module.exports = {
  BinanceClass,
};
