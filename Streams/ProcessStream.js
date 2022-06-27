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

      switch (csvFileInfo.DataType) {
        case 'aggTrades': {
          await writeToDatabase({
            dataObj: {
              AggTradeId: parseInt(values[0]),
              Price: parseFloat(values[1]),
              Quantity: parseFloat(values[2]),
              FirstTradeId: parseInt(values[3]),
              LastTradeIde: parseInt(values[4]),
              EventTime: new Date(parseFloat(values[5])).toISOString(),
              IsBuyerMarketMaker: (values[6] === 'TRUE'),
              BestTradePriceMatch: (values[7] === 'TRUE'),
              Symbol: csvFileInfo.Symbol,
            },
            table: 'AggregateTrades',
            statement: 'INSERT INTO',
          });
          break;
        }

        case 'trades': {
          await writeToDatabase({
            dataObj: {
              TradeId: parseInt(values[0]),
              Price: parseFloat(values[1]),
              Quantity: parseFloat(values[2]),
              EventTime: new Date(parseFloat(values[4])).toISOString(),
              IsBuyerMaker: (values[5] === 'TRUE'),
              Symbol: csvFileInfo.Symbol,
            },
            table: 'Trades',
            statement: 'INSERT INTO',
          });
          break;
        }
        case regexp.exec(csvFileInfo.DataType)[0]: {
          await writeToDatabase({
            dataObj: {
              OpenTime: new Date(parseFloat(values[0])).toISOString(),
              OpenPrice: parseFloat(values[1]),
              HighPrice: parseFloat(values[2]),
              LowPrice: parseFloat(values[3]),
              ClosePrice: parseFloat(values[4]),
              Volume: parseFloat(values[5]),
              CloseTime: new Date(parseFloat(values[6])).toISOString(),
              QuoteAssetVolume: parseFloat(values[7]),
              NumberOfTrades: parseInt(values[8]),
              TakerBuyBaseAssetVolume: parseFloat(values[9]),
              TakerBuyQuoteAssetVolume: parseFloat(values[10]),
              Ignore: parseInt(values[11]),
              TimeFrame: csvFileInfo.KlineTimeFrame,
              Symbol: csvFileInfo.Symbol,
            },
            table: 'Klines',
            statement: 'INSERT INTO',
          });
          break;
        }

        default: {
          ApplicationLog.info(`Data type could not be identified. Data Type: ${csvFileInfo.DataType}`);
          continue;
        }
      }
    }
  } catch (error) {
    ApplicationLog.info(`Could not write CSV data into database. ${error.stack}`);
  }
}

module.exports = {
  wssJsonStream2Object,
  csvJsonStream2Object,
};
