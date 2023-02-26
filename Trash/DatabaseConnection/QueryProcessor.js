const sqlConnector = require('./SQLConnector.js');
const onDateOperations = require('../Toolkit/OnDateOperations.js');
const {DatabaseLog, ApplicationLog} = require('../Toolkit/Logger.js');
const _ = require('lodash');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const fs = require('fs');
// const {runPsCommand} = require('../Toolkit/PowerShell.js');
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
      // result = await runPsCommand('Cryptonite.Cmc.QuotesLatest -CryptoniteJS');
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
 *
 * @param {array} inputArray // Array of objects {exchange: 'exch', currencyList: [ada, btc, stb...]}
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

module.exports = {
  totalTradedQuoteAssetVolume,
  getAvailableCurrencies,
  getNewCurrencies,
};
