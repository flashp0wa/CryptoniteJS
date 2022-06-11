const sqlConnector = require('./SQLConnector.js');
const onDateOperations = require('../Toolkit/OnDateOperations.js');
const {DatabaseLog, ApplicationLog} = require('../Toolkit/Logger.js');
const _ = require('lodash');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const fs = require('fs');
const {runPsCommand} = require('../Toolkit/PowerShell.js');
const dataBank = require('../Loaders/LoadDataBank.js');

// @ts-check
const globalEvent = returnEmitter();

/**
 * Working processor functions: getNewCurrencies
 * @param {function} processorFunction // function to process currency data
 * @return {object} // returns an array of symbols and exchange
 */
async function getAvailableCurrencies(processorFunction) {
  const returnArray = [];
  const exchanges = dataBank.getCcxtExchange('all');


  for (const [key, value] of exchanges.entries()) {
    const exchangeObj = value;
    const availableCurrencies = [];
    let result;

    try {
      const query = `SELECT TOP 1 * FROM Currencies WHERE exchange=\'${key}\'`; // Check if data is available from the exchange
      result = await sqlConnector.singleRead(query);
    } catch (error) {
      ApplicationLog.error(`Getting available currencies failed. ${error.stack}`);
    }

    ApplicationLog.info(`Loading market data for ${key}`);

    const symbols = exchangeObj.currencies;
    for (const key in symbols) {
      if (Object.hasOwnProperty.call(symbols, key)) {
        const currency = symbols[key];
        availableCurrencies.push(currency.id.toUpperCase());

        if (result.rowsAffected[0] === 0) { // This means no data from exchange in database
          ApplicationLog.info(`Writing ${currency.id.toUpperCase()} on ${key.toUpperCase()} to database...`);
          const date = new Date();
          const query = `INSERT INTO Currencies VALUES (\'${currency.id.toUpperCase().trim()}\',\'${key.toUpperCase()}\',\'${date.toISOString()}\')`;
          try {
            await sqlConnector.writeToDatabase(query);
            ApplicationLog.info('Write done!');
          } catch (error) {
            ApplicationLog.error(`Database write failed at GetAvailableCurrencies. ${error.stack}`);
          }
        }
      }
    }

    const returnObj = {
      currencyList: availableCurrencies, // array of strings ['ADA','BTC']
      exchange: key, // string
    };

    returnArray.push(returnObj);
  }


  if (processorFunction) {
    const result = await processorFunction(returnArray);
    if (!result) { // If there is no new coin return
      return returnArray;
    }
  }

  (async () => {
    let result;
    try {
      result = await runPsCommand('Cryptonite.Cmc.QuotesLatest -CryptoniteJS');
    } catch (error) {
      ApplicationLog.error(`Run PowerShell command "Cryptonite.Cmc.QuotesLatest -CryptoniteJS failed". ${error.stack}`);
    }

    if (result.match(/True*/)) {
      ApplicationLog.info('New coin info has been collected successfully!');
    } else {
      ApplicationLog.error('Collect new coin info failed!');
    }
  })();

  return returnArray;
}

/**
 * @return {array} Returns an array with all available symbols in Klines table
 */
async function getAllSymbols() {
  try {
    const query = 'SELECT Symbol FROM Klines GROUP BY Symbol';
    const results = await sqlConnector.singleRead(query);
    const symbols = [];

    for (const symbolObj of results.recordset) {
      symbols.push(symbolObj.Symbol);
    }

    return symbols;
  } catch (error) {
    ApplicationLog.error(`Could not get all symbols from database. ${error.stack}`);
  }
}

/**
 *
 * @param {array} inputArray // Array of objects
 * @return {array} returnArray // Array of objects
 * @return {boolean} // If no new currency found returns false
 */
async function getNewCurrencies(inputArray) {
  const returnMap = new Map();
  for (const obj of inputArray) {
    const query = `SELECT Currency FROM Currencies WHERE Exchange='${obj.exchange}'`;
    const refArray = [];
    const diffArray = obj.currencyList;
    const date = new Date();
    try {
      const result = await sqlConnector.singleRead(query);
      for (const obj of result.recordset) {
        refArray.push(obj.Currency);
      }
    } catch (error) {
      ApplicationLog.error(`Could not read currencies from database. ${error.stack}`);
    }

    const newCurrencies = _.difference(diffArray, refArray);
    if (newCurrencies.length > 0) {
      const stream = fs.createWriteStream('../Cryptonite/Outboxes/NewCoins.txt', {flags: 'a'});
      for (const currency of newCurrencies) {
        ApplicationLog.info(`New currency ${currency} on ${obj.exchange}`);
        const query = `INSERT INTO Currencies VALUES (\'${currency.toUpperCase()}\',\'${obj.exchange.toUpperCase()}\',\'${date.toISOString()}\')`;
        ApplicationLog.info('Sending to outboxes...');
        stream.write(`${currency}\n`);
        try {
          await sqlConnector.writeToDatabase(query);
        } catch (error) {
          ApplicationLog.error(`Failed to write new currencies into database ${error.stack}`);
        }
      }
      returnMap.set(obj.exchange, newCurrencies);
    } else {
      ApplicationLog.info(`No new currency found on ${obj.exchange}`);
    }
  }

  if (returnMap.size > 0) {
    globalEvent.emit('SendNewCurrencyEmail', returnMap);
    ApplicationLog.info('Notification email has been sent!');
    return returnMap;
  } else {
    ApplicationLog.info('No new currencies found!');
    return false;
  }
}

/**
 *
 * @param {string} operationToRun Name of the function to be returned
 * @return {function} It returns the function to the caller based on
 */
function totalTradedQuoteAssetVolume(operationToRun) {
  let reObj;

  switch (operationToRun) {
    case 'LoHiAvgTTQAV':
      reObj = async function LoHiAvgTTQAV(symbols) {
        // Data from the past 24hr
        const oneHourInMs = 1 * 24 * 60 * 60 * 1000;
        const unixNowDate = new Date().getTime();
        const dateEnd = new Date().toISOString(); // nowDate
        const dateBegin = new Date(unixNowDate - oneHourInMs).toISOString();
        const functionReturnObject = {};

        for (const symbol of symbols) {
          try {
            const sqlObject = await sqlConnector.sproc_TTQAV(symbol, dateBegin, dateEnd);

            functionReturnObject[symbol] = {
              LowestTradedQuoteAssetVolume: sqlObject.output.lowestVolumeOut,
              HighestTradedQuoteAssetVolume: sqlObject.output.highestVolumeOut,
              AverageTradedQuoteAssetVolume: sqlObject.output.averageVolumeOut,
            };
          } catch (error) {
            DatabaseLog.error(`Error occured processing TotalTradedQuoteAssetVolume. ${error.stack}`);
          }
        }
        return functionReturnObject;
      };
      break;

    case 'ETBIDTP':
      reObj = async function ElapsedTimeBetweenIncreaseDecreaseTTQAVPrice() {
        const query = 'SELECT TotalTradedQuoteAssetVolume, EventTime FROM IndividualSymbolTickerStream ORDER BY EventTime ASC';

        let baseObject;
        let lastObject;
        let firstRun = true;
        let changeToDecrease = false;
        let changeToIncrease = false;
        let priceIncreasing;
        let priceDecreasing;
        let actualHighestIncreaseTime = 0;
        let actualHighestDecreaseTime = 0;
        /**
        *
        * @param {array} rowsToProcess // Contains the rows from database
        * // Running on data event
        */
        function processorFunction(rowsToProcess) {
          // Check if this is the first returned block of the data stream (SQL)
          if (firstRun) {
            baseObject = rowsToProcess[0];
            const firstRow = rowsToProcess[0].TotalTradedQuoteAssetVolume;
            const secondRow = rowsToProcess[1].TotalTradedQuoteAssetVolume;
            if (firstRow > secondRow) {
              lastObject = rowsToProcess[1];
              priceDecreasing = true;
            } else {
              lastObject = rowsToProcess[1];
              priceIncreasing = true;
            }
            firstRun = false;
            // Remove the above 0th and 1st rows from the array,
            // calculation already made... no need anymore
            rowsToProcess.shift();
            rowsToProcess.shift();
          }
          for (let i = 0; i < rowsToProcess.length; i++) {
            const currentData = row.TotalTradedQuoteAssetVolume;
            const previousData = lastObject.TotalTradedQuoteAssetVolume;
            if ((currentData > previousData) && priceIncreasing) {
              lastObject = row;
            } else if ((currentData < previousData) && priceIncreasing) {
              changeToDecrease = true;
              priceDecreasing = true;
              priceIncreasing = false;
            } else if ((currentData < previousData) && priceDecreasing) {
              lastObject = row;
            } else if ((currentData > previousData) && priceDecreasing) {
              changeToIncrease = true;
              priceIncreasing = true;
              priceDecreasing = false;
            } else {
              lastObject = row;
              continue;
            }
            if (!changeToIncrease && !changeToDecrease) {
              continue;
            } else if (changeToDecrease) {
              const beginDate = baseObject.EventTime;
              const endDate = row.EventTime;
              const actualIncreaseTimeInMinutes = onDateOperations.getTimeBetweenDates(beginDate, endDate);
              if (actualIncreaseTimeInMinutes > actualHighestIncreaseTime) {
                actualHighestIncreaseTime = actualIncreaseTimeInMinutes;
                baseObject = row;
                lastObject = row;
              }
              changeToDecrease = false;
            } else if (changeToIncrease) {
              const beginDate = baseObject.EventTime;
              const endDate = row.EventTime;
              const actualDecreaseTimeInMinutes = onDateOperations.getTimeBetweenDates(beginDate, endDate);
              if (actualDecreaseTimeInMinutes > actualHighestDecreaseTime) {
                actualHighestDecreaseTime = actualDecreaseTimeInMinutes;
                baseObject = row;
                lastObject = row;
              }
              changeToIncrease = false;
            }
          }
        }
        /**
 *
 * @param {array} rowsToProcess
 * @return {object} // The maximum amount of time
 * the price spent increasing or decreasing
 */
        function processorFunctionOnDone(rowsToProcess) {
          for (let i = 0; i < rowsToProcess.length; i++) {
            if ((currentData > previousData) && priceIncreasing) {
              lastObject = row;
            } else if ((currentData < previousData) && priceIncreasing) {
              changeToDecrease = true;
              priceDecreasing = true;
              priceIncreasing = false;
            } else if ((currentData < previousData) && priceDecreasing) {
              lastObject = row;
            } else if ((currentData > previousData) && priceDecreasing) {
              changeToIncrease = true;
              priceIncreasing = true;
              priceDecreasing = false;
            } else {
              lastObject = row;
              continue;
            }

            if (!changeToIncrease && !changeToDecrease) {
              continue;
            } else if (changeToDecrease) {
              const beginDate = baseObject.EventTime;
              const endDate = row.EventTime;
              const actualIncreaseTimeInMinutes = onDateOperations.getTimeBetweenDates(beginDate, endDate);

              if (actualIncreaseTimeInMinutes > actualHighestIncreaseTime) {
                actualHighestIncreaseTime = actualIncreaseTimeInMinutes;
                baseObject = row;
                lastObject = row;
              }
              changeToDecrease = false;
            } else if (changeToIncrease) {
              const beginDate = baseObject.EventTime;
              const endDate = row.EventTime;
              const actualDecreaseTimeInMinutes = onDateOperations.getTimeBetweenDates(beginDate, endDate);

              if (actualDecreaseTimeInMinutes > actualHighestDecreaseTime) {
                actualHighestDecreaseTime = actualDecreaseTimeInMinutes;
                baseObject = row;
                lastObject = row;
              }
              changeToIncrease = false;
            }
          }

          return reObj = {
            HighestIncreaseTime: actualHighestIncreaseTime,
            HighestDecreaseTime: actualHighestDecreaseTime,
          };
        }
        try {
          const result = await sqlConnector.streamRead(query, processorFunction, processorFunctionOnDone);
          return result;
        } catch (error) {
          ApplicationLog.error(`Could not read from database. ${error.stack}`);
        }
      };
      break;

    default:
      console.log('No operation has been selected!');
      break;
  }

  return reObj;
}

/**
 *
 * @param {array} symbols // List of symbols to caclulate SMA
 * @return {object} // Result object with the values
 */
async function simpleMovingAverage(symbols) {
  const today = new Date();
  const dateEnd = new Date().toISOString(); // nowDate
  const functionReturnObject = {};
  for (const symbol of symbols) {
    try {
      // Define begin dates for moving average query
      const sevenDayUnixTime = 7 * 24 * 60 * 60 * 1000;
      const fiftDayUnixTime = 50 * 24 * 60 * 60 * 1000;
      const twoDayUnixTime = 200 * 24 * 60 * 60 * 1000;
      const nowUnixTime = new Date().getTime();
      const dateBegin7 = new Date(nowUnixTime - sevenDayUnixTime).toISOString();
      const dateBegin50 = new Date(nowUnixTime - fiftDayUnixTime).toISOString();
      const dateBegin200 = new Date(nowUnixTime - twoDayUnixTime).toISOString();
      let reObj7days = sqlConnector.sproc_SMA(symbol, dateBegin7, dateEnd);
      let reObj50days = sqlConnector.sproc_SMA(symbol, dateBegin50, dateEnd);
      let reObj200days = sqlConnector.sproc_SMA(symbol, dateBegin200, dateEnd);
      try {
        reObj7days = await reObj7days;
        reObj50days = await reObj50days;
        reObj200days = await reObj200days;
      } catch (error) {
        ApplicationLog.error(`Could not run stored procedure. ${error.stack}`);
      }
      functionReturnObject[symbol] = {
        SMA7Days: reObj7days.output.SMAOut,
        SMA50Days: reObj50days.output.SMAOut,
        SMA200Days: reObj200days.output.SMAOut,
      };
      if (reObj50days.output.SMAOut > reObj200days.output.SMAOut) {
        functionReturnObject[symbol].Signal = 'Bullish';
      } else if (reObj50days.output.SMAOut < reObj200days.output.SMAOut) {
        functionReturnObject[symbol].Signal = 'Bearish';
      } else {
        functionReturnObject[symbol].Signal = 'IDunno';
      }
      // Write data into database once a day
      const query = 'SELECT TOP 1 EventTime FROM SimpleMovingAverage ORDER BY EventTime DESC';
      const queryResult = await sqlConnector.singleRead(query);
      const lastWriteTime = queryResult.recordset[0].EventTime;
      // If last entry in the database older than today, write to database
      const canWrite = onDateOperations.compareDatum(lastWriteTime, today);
      if (canWrite) {
        const query = `INSERT INTO SimpleMovingAverage VALUES (\'${symbol.toUpperCase()}\',\'${today.toISOString()}\',\'${parseFloat(reObj7days.output.SMAOut)}\',\'${parseFloat(reObj50days.output.SMAOut)}\',\'${parseFloat(reObj200days.output.SMAOut)}\')`;
        sqlConnector.writeToDatabase(query);
      }
    } catch (error) {
      DatabaseLog.error(`Error occured processing SimpleMovingAverage. ${error.stack}`);
    }
  }
  console.log(functionReturnObject);
  return functionReturnObject;
}

/**
 *
 * @param {array} symbolsFromParam //If null all symbols in db will be used
 */
async function onBalanceVolume(symbolsFromParam) {
  const lastObv = new Map();
  const lastPrice = new Map();
  let symbols;

  if (!symbolsFromParam) {
    try {
      const query = 'SELECT Symbol FROM Klines GROUP BY Symbol';
      const results = await sqlConnector.singleRead(query);
      symbols = getAllSymbols();

      for (const symbolObj of results.recordset) {
        symbols.push(symbolObj.Symbol);
      }
    } catch (error) {
      ApplicationLog.error(`Could not read symbols from database. ${error.stack}`);
    }
  } else {
    symbols = symbolsFromParam;
  }

  /**
   *
   * @param {array} rowsToProcess // Rows from the stream read
   */
  async function processorFunction(rowsToProcess) {
    for (const row of rowsToProcess) {
      let obv;
      if (!lastObv.get(row.Symbol)) {
        lastObv.set(row.Symbol, row.QuoteAssetVolume);
        lastPrice.set(row.Symbol, row.ClosePrice);
        continue;
      } else {
        if (lastPrice.get(row.Symbol) > row.ClosePrice) {
          obv = lastObv.get(row.Symbol) - row.QuoteAssetVolume;
          lastPrice.set(row.Symbol, row.ClosePrice);
          lastObv.set(row.Symbol, obv);
        } else if (lastPrice.get(row.Symbol) === row.ClosePrice) {
          obv = lastObv.get(row.Symbol) + 0;
          lastObv.set(row.Symbol, obv);
          lastPrice.set(row.Symbol, row.ClosePrice);
        } else {
          obv = lastObv.get(row.Symbol) + row.QuoteAssetVolume;
          lastObv.set(row.Symbol, obv);
          lastPrice.set(row.Symbol, row.ClosePrice);
        }
      }
      const date = new Date(row.CloseTime).toISOString();
      const query = `INSERT INTO OnBalanceVolume VALUES (${obv},\'${date}\',\'${row.Symbol}\')`;
      try {
        await sqlConnector.writeToDatabase(query);
      } catch (error) {
        ApplicationLog.error(`An error occured while writing On Balance Volume to database. ${error.stack}`);
      }
    }
    return true;
  }

  for (const symbol of symbols) {
    const query = `SELECT CloseTime, ClosePrice, QuoteAssetVolume, Symbol FROM Klines WHERE Symbol=\'${symbol}\' AND TimeFrame=\'1d\' ORDER BY CloseTime ASC`; // Switch timeframe to modify precision
    sqlConnector.streamRead(query, processorFunction, processorFunction);
  }
}

/**
 * Accumulation/Distribution Indicator
 * @param {array} symbolsFromParam // If null all symbols in db will be used
 */
async function adIndicator(symbolsFromParam) {
  let moneyFlowMultiplier;
  let moneyFlowVolume;
  let prevAd;
  let ad;
  let symbols;

  if (!symbolsFromParam) {
    try {
      const query = 'SELECT Symbol FROM Klines GROUP BY Symbol';
      const results = await sqlConnector.singleRead(query);
      symbols = getAllSymbols();

      for (const symbolObj of results.recordset) {
        symbols.push(symbolObj.Symbol);
      }
    } catch (error) {
      ApplicationLog.error(`Could not read symbols from database. ${error.stack}`);
    }
  } else {
    symbols = symbolsFromParam;
  }

  async function processorFunction(rowsToProcess) {
    for (const row of rowsToProcess) {
      // eslint-disable-next-line max-len
      moneyFlowMultiplier = ((row.ClosePrice - row.LowPrice) - (row.HighPrice - row.ClosePrice)) / (row.HighPrice - row.LowPrice);
      moneyFlowVolume = moneyFlowMultiplier * row.QuoteAssetVolume;

      if (!prevAd) {
        prevAd = moneyFlowVolume;
        ad = moneyFlowVolume;
      } else {
        ad = prevAd + moneyFlowVolume;
        prevAd = ad;
      }

      const date = new Date(row.CloseTime).toISOString();
      // eslint-disable-next-line max-len
      const query = `INSERT INTO AdIndicator VALUES (${ad},\'${date}\',\'${row.Symbol}\')`;
      try {
        await sqlConnector.writeToDatabase(query);
      } catch (error) {
        // eslint-disable-next-line max-len
        ApplicationLog.error(`An error occured while writing AD Indicator to database. ${error.stack}`);
      }
    }
    return true;
  }
  for (const symbol of symbols) {
    const query = `SELECT CloseTime, ClosePrice, LowPrice, HighPrice QuoteAssetVolume, Symbol FROM Klines WHERE Symbol=\'${symbol}\' AND TimeFrame=\'1d\' ORDER BY CloseTime ASC`; // Switch timeframe to modify precision
    sqlConnector.streamRead(query, processorFunction, processorFunction);
  }
}

module.exports = {
  totalTradedQuoteAssetVolume,
  simpleMovingAverage,
  onBalanceVolume,
  adIndicator,
  getAvailableCurrencies,
  getNewCurrencies,
};
