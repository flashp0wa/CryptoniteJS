// const onMessageOperations = require('./WssStreamHandler/OnMessageOperations.js');
// const {writeToDatabase} = require('../DatabaseConnection/SQLConnector.js');


// Create object from json stream with SLQ insert string
// @ts-check
/**
 *
 * @param {object} jsonStreamObj
 */
function wssJsonStream2Object(jsonStreamObj) {
  'use strict';

  const streamType = jsonStreamObj['data']['e'];
  const eventUnixTime = jsonStreamObj['data']['E'];
  const processedStream = {};

  switch (streamType) {
    case '24hrTicker': {
      processedStream.EventType = jsonStreamObj['data']['e'];
      processedStream.EventTime = new Date(eventUnixTime).toISOString();
      processedStream.Symbol = jsonStreamObj['data']['s'];
      processedStream.PriceChange = jsonStreamObj['data']['p'];
      processedStream.PriceChangePercent = jsonStreamObj['data']['P'];
      processedStream.WeightedAveragePrice = jsonStreamObj['data']['w'];
      processedStream.FirstTradePrice = jsonStreamObj['data']['x'];
      processedStream.LastPrice = jsonStreamObj['data']['c'];
      processedStream.LastQuantity = jsonStreamObj['data']['Q'];
      processedStream.BestBidPrice = jsonStreamObj['data']['b'];
      processedStream.BestBidQuantity = jsonStreamObj['data']['B'];
      processedStream.BestAskPrice = jsonStreamObj['data']['a'];
      processedStream.BestAskQuantity = jsonStreamObj['data']['A'];
      processedStream.OpenPrice = jsonStreamObj['data']['o'];
      processedStream.HighPrice = jsonStreamObj['data']['h'];
      processedStream.LowPrice = jsonStreamObj['data']['l'];
      processedStream.TotalTradedBaseAssetVolume = jsonStreamObj['data']['v'];
      processedStream.TotalTradedQuoteAssetVolume = jsonStreamObj['data']['q'];
      processedStream.StatisticsTimeOpen = jsonStreamObj['data']['O'];
      processedStream.StatisticsCloseTime = jsonStreamObj['data']['C'];
      processedStream.FirstTradeId = jsonStreamObj['data']['F'];
      processedStream.LastTradeId = jsonStreamObj['data']['L'];
      processedStream.TotalTrades = jsonStreamObj['data']['n'];

      console.log(processedStream);
      // processedStream.sqlInsertString = `INSERT INTO IndividualSymbolTickerStream VALUES (\'${processedStream.PriceChange}\',\'${processedStream.PriceChangePercent}\',\'${processedStream.WeightedAveragePrice}\',\'${processedStream.FirstTradePrice}\',\'${processedStream.LastPrice}\',\'${processedStream.LastQuantity}\',\'${processedStream.BestBidPrice}\',\'${processedStream.BestBidQuantity}\',\'${processedStream.BestAskPrice}\',\'${processedStream.BestAskQuantity}\',\'${processedStream.OpenPrice}\',\'${processedStream.HighPrice}\',\'${processedStream.LowPrice}\',\'${processedStream.TotalTradedBaseAssetVolume}\',\'${processedStream.TotalTradedQuoteAssetVolume}\',\'${processedStream.StatisticsTimeOpen}\',\'${processedStream.StatisticsCloseTime}\',\'${processedStream.FirstTradeId}\',\'${processedStream.LastTradeId}\',\'${processedStream.TotalTrades}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
      // writeToDatabase(processedStream.sqlInsertString);
      // onMessageOperations.stream_TotalTradedQuoteAssetVolume(processedStream);
      // onMessageOperations.stream_CalculateCoinPairPriceGap(processedStream);
      // onMessageOperations.stream_PriceWatch(processedStream);

      break;
    }
    case 'trade': {
      processedStream.EventType = jsonStreamObj['data']['e'];
      processedStream.EventTime = new Date(eventUnixTime).toISOString();
      processedStream.Symbol = jsonStreamObj['data']['s'];
      processedStream.TradeId = jsonStreamObj['data']['t'];
      processedStream.Price = jsonStreamObj['data']['p'];
      processedStream.Quantity = jsonStreamObj['data']['q'];
      processedStream.BuyerOrderId = jsonStreamObj['data']['b'];
      processedStream.SellerOrderId = jsonStreamObj['data']['a'];
      processedStream.TradeTime = new Date(eventUnixTime).toISOString();
      processedStream.IsBuyerMarketMaker = jsonStreamObj['data']['m'];
      processedStream.Ignore = jsonStreamObj['data']['M'];

      // processedStream.sqlInsertString = `INSERT INTO Trades VALUES (\'${processedStream.TradeId}\',\'${processedStream.Price}\',\'${processedStream.Quantity}\',\'${processedStream.BuyerOrderId}\',\'${processedStream.SellerOrderId}\',\'${processedStream.TradeTime}\',\'${processedStream.IsBuyerMarketMaker}\',\'${processedStream.Ignore}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
      // writeToDatabase(processedStream.sqlInsertString);
      break;
    }
    default:
      break;
  }
}
module.exports = {
  wssJsonStream2Object,
};
