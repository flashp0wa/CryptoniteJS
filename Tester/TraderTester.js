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

  // Connection established message
  ws.onopen = () => {
    ApplicationLog.log({
      level: 'info',
      message: 'Connection has been established with the stream server',
      senderFunction: 'startWss',
      file: 'BinanceClass.js',
    });
  };

  // Data received from server as string...
  // Making it JSON and writing to database
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // console.log(data);
    const processedData = wssJsonStream2Object(data);
    // this.strategy.run_srCandleTree(processedData);
  };
  // Connection closed. Will try reconnecting
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

  // Error establishing connection
  ws.onerror = (error) => {
    ApplicationLog.log({
      level: 'info',
      message: `Connection could not be established with the stream server. ${JSON.stringify(error)}`,
      senderFunction: 'startWss',
      file: 'BinanceClass.js',
    });
    throw new Error(`Connection could not be established: ${JSON.stringify(error)}`);
  };
}