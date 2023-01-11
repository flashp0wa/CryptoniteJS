const {CreateOrder} = require('./Order/CreateOrderClass');
const {OpenOrder} = require('./Order/OpenOrderClass');
const {ApplicationLog} = require('../../../Toolkit/Logger');
// const WebSocket = require('websocket').w3cwebsocket;
const WebSocket = require('ws');
const {
  sproc_AddSymbolToDatabase,
  singleRead,
} = require('../../../DatabaseConnection/SQLConnector');
const {StrategyClass} = require('../../StrategyClass');
const {stream_getCandleType} = require('../../../Streams/OnMessageOperations');
// const [downloadHistoryData] = require('../../../Toolkit/BncHistoryDownload');


class BinanceClass {
  constructor(excName) {
    this.excName = excName;
    this.markets;
    this.symbolList = [];
    this.excObj;
    this.openOrders;
    this.strategy = new StrategyClass(this.excObj, this.excName);
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
      const response = await singleRead(`select * from itvf_GetExchangeId('${this.excName}')`);
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
  loadSymbols() {
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
        sproc_AddSymbolToDatabase(actualSymbol, this.exchangeId);
      }
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
    new CreateOrder(this.excObj, this.excName, conObj).createOrder();
  }
  /**
   * Loads exchange data
   */
  async loadExchange() {
    try {
      this.loadOpenOrders();
      await this.loadMarkets();
      await this.loadExchangeId();
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

  startWss() {
    /**
    *
    * @param {object} jsonStreamObj
    * @return {object} Returns the processed object
    */
    function wssJsonStream2Object(jsonStreamObj) {
      const streamType = jsonStreamObj['data']['e'];
      jsonStreamObj = jsonStreamObj['data'];
      // const eventUnixTime = jsonStreamObj['data']['E'];
      let processedStream = {};

      switch (streamType) {
        // case '24hrTicker': {
        //   processedStream.EventType = jsonStreamObj['data']['e'];
        //   processedStream.EventTime = new Date(eventUnixTime).toISOString();
        //   processedStream.Symbol = jsonStreamObj['data']['s'];
        //   processedStream.PriceChange = jsonStreamObj['data']['p'];
        //   processedStream.PriceChangePercent = jsonStreamObj['data']['P'];
        //   processedStream.WeightedAveragePrice = jsonStreamObj['data']['w'];
        //   processedStream.FirstTradePrice = jsonStreamObj['data']['x'];
        //   processedStream.LastPrice = jsonStreamObj['data']['c'];
        //   processedStream.LastQuantity = jsonStreamObj['data']['Q'];
        //   processedStream.BestBidPrice = jsonStreamObj['data']['b'];
        //   processedStream.BestBidQuantity = jsonStreamObj['data']['B'];
        //   processedStream.BestAskPrice = jsonStreamObj['data']['a'];
        //   processedStream.BestAskQuantity = jsonStreamObj['data']['A'];
        //   processedStream.OpenPrice = jsonStreamObj['data']['o'];
        //   processedStream.HighPrice = jsonStreamObj['data']['h'];
        //   processedStream.LowPrice = jsonStreamObj['data']['l'];
        //   processedStream.TotalTradedBaseAssetVolume = jsonStreamObj['data']['v'];
        //   processedStream.TotalTradedQuoteAssetVolume = jsonStreamObj['data']['q'];
        //   processedStream.StatisticsTimeOpen = jsonStreamObj['data']['O'];
        //   processedStream.StatisticsCloseTime = jsonStreamObj['data']['C'];
        //   processedStream.FirstTradeId = jsonStreamObj['data']['F'];
        //   processedStream.LastTradeId = jsonStreamObj['data']['L'];
        //   processedStream.TotalTrades = jsonStreamObj['data']['n'];

        //   processedStream.sqlInsertString = `INSERT INTO IndividualSymbolTickerStream VALUES (\'${processedStream.PriceChange}\',\'${processedStream.PriceChangePercent}\',\'${processedStream.WeightedAveragePrice}\',\'${processedStream.FirstTradePrice}\',\'${processedStream.LastPrice}\',\'${processedStream.LastQuantity}\',\'${processedStream.BestBidPrice}\',\'${processedStream.BestBidQuantity}\',\'${processedStream.BestAskPrice}\',\'${processedStream.BestAskQuantity}\',\'${processedStream.OpenPrice}\',\'${processedStream.HighPrice}\',\'${processedStream.LowPrice}\',\'${processedStream.TotalTradedBaseAssetVolume}\',\'${processedStream.TotalTradedQuoteAssetVolume}\',\'${processedStream.StatisticsTimeOpen}\',\'${processedStream.StatisticsCloseTime}\',\'${processedStream.FirstTradeId}\',\'${processedStream.LastTradeId}\',\'${processedStream.TotalTrades}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
        //   writeToDatabase(processedStream.sqlInsertString);
        //   onMessageOperations.stream_TotalTradedQuoteAssetVolume(processedStream);
        //   onMessageOperations.stream_CalculateCoinPairPriceGap(processedStream);
        //   onMessageOperations.stream_PriceWatch(processedStream);

        //   break;
        // }
        case 'kline': {
          processedStream.openTime = new Date(jsonStreamObj['k']['t']);
          processedStream.closeTime = new Date(jsonStreamObj['k']['T']);
          processedStream.symbol = jsonStreamObj['k']['s'];
          processedStream.timeFrame = jsonStreamObj['k']['i'];
          processedStream.FirstTradeId = jsonStreamObj['k']['f'];
          processedStream.LastTradeId = jsonStreamObj['k']['L'];
          processedStream.openPrice = parseFloat(jsonStreamObj['k']['o']);
          processedStream.closePrice = parseFloat(jsonStreamObj['k']['c']);
          processedStream.highPrice = parseFloat(jsonStreamObj['k']['h']);
          processedStream.lowPrice = parseFloat(jsonStreamObj['k']['l']);
          processedStream.baseAssetVolume = parseFloat(jsonStreamObj['k']['v']);
          processedStream.numberOfTrades = jsonStreamObj['k']['n'];
          processedStream.closed = jsonStreamObj['k']['x'];
          processedStream.quoteAssetVolume = parseFloat(jsonStreamObj['k']['q']);
          processedStream.takerBuyBaseAssetVolume = parseFloat(jsonStreamObj['k']['V']);
          processedStream.takerBuyQuoteAssetVolume = parseFloat(jsonStreamObj['k']['Q']);
          processedStream.ignore = parseInt(jsonStreamObj['k']['B']);

          processedStream = stream_getCandleType(processedStream);
          return processedStream;
        }

        // case 'trade': {
        //   processedStream.EventType = jsonStreamObj['data']['e'];
        //   processedStream.EventTime = new Date(eventUnixTime).toISOString();
        //   processedStream.Symbol = jsonStreamObj['data']['s'];
        //   processedStream.TradeId = jsonStreamObj['data']['t'];
        //   processedStream.Price = jsonStreamObj['data']['p'];
        //   processedStream.Quantity = jsonStreamObj['data']['q'];
        //   processedStream.BuyerOrderId = jsonStreamObj['data']['b'];
        //   processedStream.SellerOrderId = jsonStreamObj['data']['a'];
        //   processedStream.TradeTime = new Date(eventUnixTime).toISOString();
        //   processedStream.IsBuyerMarketMaker = jsonStreamObj['data']['m'];
        //   processedStream.Ignore = jsonStreamObj['data']['M'];

        //   processedStream.sqlInsertString = `INSERT INTO Trades VALUES (\'${processedStream.TradeId}\',\'${processedStream.Price}\',\'${processedStream.Quantity}\',\'${processedStream.BuyerOrderId}\',\'${processedStream.SellerOrderId}\',\'${processedStream.TradeTime}\',\'${processedStream.IsBuyerMarketMaker}\',\'${processedStream.Ignore}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
        //   writeToDatabase(processedStream.sqlInsertString);
        //   break;
        // }
        default:
          break;
      }
    }

    const streams = [
      'btcusdt@kline_5m',
      'ethusdt@kline_5m',
      // 'ethusdt@ticker',
    ];

    // Build URL
    let url;
    const baseUrl = process.env.BNC_WSS_URL;

    if (!streams) {
      ApplicationLog.log({
        level: 'info',
        message: 'No stream have been defined. Could not build URL',
        senderFunction: 'startWss',
        file: 'BinanceClass.js',
      });
      throw new Error('No streams have been defined.');
    } else if (streams.length === 1) {
      url = baseUrl + 'ws/' + streams;
    } else {
      url = `${baseUrl}stream?streams=`;
      for (let index = 0; index < streams.length; index++) {
        url += streams[index] + '/';
        // Do not place forward slash at the end of the URL
        if (streams.length === index + 1) {
          url += streams[index];
        }
      }
    }
    ApplicationLog.log({
      level: 'info',
      message: `URL build succeeded. Stream URL: ${url}`,
      senderFunction: 'startWss',
      file: 'BinanceClass.js',
    });

    const ws = new WebSocket(url);

    ws.on('open', function open() {
      ApplicationLog.log({
        level: 'info',
        message: 'Connection has been established with the stream server',
        senderFunction: 'startWss',
        file: 'BinanceClass.js',
      });
    });

    ws.onclose = () => {
      ApplicationLog.log({
        level: 'info',
        message: 'Stream connection has been closed... trying to reconnect',
        senderFunction: 'startWss',
        file: 'BinanceClass.js',
      });
      setTimeout(() => {
        this.startWss();
      }, 3);
    };

    ws.on('message', (data) => {
      data = JSON.parse(data);
      const processedData = wssJsonStream2Object(data);
      console.log(processedData);
      this.strategy.run_srCandleTree(processedData);
    });

    // ws.onmessage = (data) => {
    //   console.log(data.event);
    //   // data = JSON.parse(data);
    //   const processedData = wssJsonStream2Object(data);
    //   console.log(processedData);
    //   // this.strategy.run_srCandleTree(processedData);
    // };

    ws.on('error', function error(error) {
      ApplicationLog.log({
        level: 'info',
        message: `Connection could not be established with the stream server. ${error}`,
        senderFunction: 'startWss',
        file: 'BinanceClass.js',
      });
    });
  }
}

module.exports = {
  BinanceClass,
};
