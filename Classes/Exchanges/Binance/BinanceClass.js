const {Order} = require('./Order/OrderClass');
const {OpenOrder} = require('./Order/OpenOrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
const {getTechnicalIndicators} = require('../../TechnicalIndicatorClass');
const {getDatabase} = require('../../Database');
const {StrategyClass} = require('../../StrategyClass');


class BinanceClass {
  constructor(excName) {
    this.excName = excName;
    this.markets;
    this.symbolList = [];
    this.excObj;
    this.openOrders;
    this.strategy;
    this.technicalIndicator;
    this.db = getDatabase();
    this.isPostOnly = true;
  }
  /**
   * Loads technical indicator class
   */
  async loadTechnicalIndicator() {
    this.technicalIndicator = getTechnicalIndicators();
  }
  /**
   * Loads open orders for exchagne
   */
  loadOpenOrders() {
    ApplicationLog.log({
      level: 'info',
      message: `Loading open orders on ${this.excName}`,
      senderFunction: 'loadOpenOrders',
      file: 'BinanceClass.js',
    });
    this.openOrders = new OpenOrder(this.excObj, this.excName);
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
  async loadSymbols() {
    try {
      ApplicationLog.log({
        level: 'info',
        message: `Loading symbols on ${this.excName}`,
        senderFunction: 'loadSymbols',
        file: 'BinanceClass.js',
      });
      if (this.symbolList.length !== 0) {
        this.symbolList = [];
      }
      for (const market of Object.keys(this.markets)) {
        const actualSymbol = this.markets[market].info.symbol;
        this.symbolList.push(actualSymbol);
        await this.db.sproc_AddSymbolToDatabase(actualSymbol, this.excObj.id);
      }

      ApplicationLog.log({
        level: 'info',
        message: `Symbols loaded on ${this.excName}`,
        senderFunction: 'loadSymbols',
        file: 'BinanceClass.js',
      });
    } catch (error) {
      ApplicationLog.log({
        level: 'warn',
        message: `Loading symbols failed on ${this.excName}. ${error}`,
        senderFunction: 'loadSymbols',
        file: 'BinanceClass.js',
      });
    }
  }
  /**
   *
   * @param {object} conObj Constructor object containing order details
   * { symbol, side, orderType, orderAmount, buyPrice, }
   */
  createOrder(conObj) {
    new Order(this.excObj, this.excName, conObj).createOrder();
  }
  /**
   * Loads exchange data
   */
  async loadExchange() {
    try {
      this.loadOpenOrders();
      await this.loadExchangeId();
      await this.loadMarkets();
      await this.loadTechnicalIndicator();
      this.loadSymbols();
      this.strategy = new StrategyClass(this.excObj, this.excName);
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
