const {ApplicationLog} = require('../Toolkit/Logger.js');
const onMessageOperations = require('./WssStreamHandler/OnMessageOperations.js');
const {writeToDatabase} = require('../DatabaseConnection/SQLConnector.js');


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

      processedStream.sqlInsertString = `INSERT INTO IndividualSymbolTickerStream VALUES (\'${processedStream.PriceChange}\',\'${processedStream.PriceChangePercent}\',\'${processedStream.WeightedAveragePrice}\',\'${processedStream.FirstTradePrice}\',\'${processedStream.LastPrice}\',\'${processedStream.LastQuantity}\',\'${processedStream.BestBidPrice}\',\'${processedStream.BestBidQuantity}\',\'${processedStream.BestAskPrice}\',\'${processedStream.BestAskQuantity}\',\'${processedStream.OpenPrice}\',\'${processedStream.HighPrice}\',\'${processedStream.LowPrice}\',\'${processedStream.TotalTradedBaseAssetVolume}\',\'${processedStream.TotalTradedQuoteAssetVolume}\',\'${processedStream.StatisticsTimeOpen}\',\'${processedStream.StatisticsCloseTime}\',\'${processedStream.FirstTradeId}\',\'${processedStream.LastTradeId}\',\'${processedStream.TotalTrades}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
      writeToDatabase(processedStream.sqlInsertString);
      // onMessageOperations.stream_TotalTradedQuoteAssetVolume(processedStream);
      // onMessageOperations.stream_CalculateCoinPairPriceGap(processedStream);
      onMessageOperations.stream_PriceWatch(processedStream);

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

      processedStream.sqlInsertString = `INSERT INTO Trades VALUES (\'${processedStream.TradeId}\',\'${processedStream.Price}\',\'${processedStream.Quantity}\',\'${processedStream.BuyerOrderId}\',\'${processedStream.SellerOrderId}\',\'${processedStream.TradeTime}\',\'${processedStream.IsBuyerMarketMaker}\',\'${processedStream.Ignore}\',\'${processedStream.EventType}\',\'${processedStream.EventTime}\',\'${processedStream.Symbol}\')`;
      writeToDatabase(processedStream.sqlInsertString);
      break;
    }
    default:
      break;
  }
}
/**
 *
 * @param {object} jsonStreamArray
 * @param {object} csvFileInfo // The name of the CSV file objectified
 */
async function csvJsonStream2Object(jsonStreamArray, csvFileInfo) {
  // The object in case of csv read is an array of objects (header + value)
  try {
    for (let i = 0; i < jsonStreamArray.length; i++) {
      const values = jsonStreamArray[i];
      const regexp = new RegExp(/kline...*/);
      let query;

      switch (csvFileInfo.DataType) {
        case 'aggTrades': {
          const aggTradeId = parseInt(values[0]);
          const price = parseFloat(values[1]);
          const quantity = parseFloat(values[2]);
          const firstTradeId = parseInt(values[3]);
          const lastTradeIde = parseInt(values[4]);
          const eventTime = new Date(parseFloat(values[5])).toISOString();
          const isBuyerMarketMaker = (values[6] === 'TRUE');
          const bestTradePriceMatch = (values[7] === 'TRUE');

          // eslint-disable-next-line max-len
          query = `INSERT INTO AggregateTrades VALUES (\'${aggTradeId}\',\'${price}\',\'${quantity}\',\'${firstTradeId}\',\'${lastTradeIde}\',\'${eventTime}\',\'${isBuyerMarketMaker}\',\'${bestTradePriceMatch}\',\'${csvFileInfo.Symbol}\')`;
          break;
        }

        case 'trades': {
          const tradeId = parseInt(values[0]);
          const price = parseFloat(values[1]);
          const quantity = parseFloat(values[2]);
          // const quoteQuantity = parseFloat(values[3]);
          const eventTime = new Date(parseFloat(values[4])).toISOString();
          const isBuyerMaker = (values[5] === 'TRUE');
          // const isBestMatch = (values[6] === 'TRUE');
          const lol = 0;

          // eslint-disable-next-line max-len
          query = `INSERT INTO Trades VALUES (\'${tradeId}\',\'${price}\',\'${quantity}\',\'${lol}\',\'${lol}\',\'${eventTime}\',\'${isBuyerMaker}\',\'${lol}\',\'${lol}\',\'${eventTime}\',\'${csvFileInfo.Symbol}\')`;
          break;
        }
        case regexp.exec(csvFileInfo.DataType)[0]: {
          const openTime = new Date(parseFloat(values[0])).toISOString();
          const openPrice = parseFloat(values[1]);
          const highPrice = parseFloat(values[2]);
          const lowPrice = parseFloat(values[3]);
          const closePrice = parseFloat(values[4]);
          const volume = parseFloat(values[5]);
          const closeTime = new Date(parseFloat(values[6])).toISOString();
          const quoteAssetVolume = parseFloat(values[7]);
          const numberOfTrades = parseInt(values[8]);
          const takerBuyBaseAssetVolume = parseFloat(values[9]);
          const takerBuyQuoteAssetVolume = parseFloat(values[10]);
          const ignore = parseInt(values[11]);

          // eslint-disable-next-line max-len
          query = `INSERT INTO Klines VALUES (\'${openTime}\',\'${openPrice}\',\'${highPrice}\',\'${lowPrice}\',\'${closePrice}\',\'${volume}\',\'${closeTime}\',\'${quoteAssetVolume}\',\'${numberOfTrades}\',\'${takerBuyBaseAssetVolume}\',\'${takerBuyQuoteAssetVolume}\',\'${ignore}\',\'${csvFileInfo.KlineTimeFrame}\',\'${csvFileInfo.Symbol}\')`;
          break;
        }

        default: {
          // eslint-disable-next-line max-len
          ApplicationLog.info(`Data type could not be identified. Data Type: ${csvFileInfo.DataType}`);
          continue;
        }
      }
      await writeToDatabase(query);
    }
  } catch (error) {
    ApplicationLog.info(`Parsing CSV failed. ${error}`);
  }
  ApplicationLog.info('Data has been successfully inserted into database');
}

module.exports = {
  wssJsonStream2Object,
  csvJsonStream2Object,
};
