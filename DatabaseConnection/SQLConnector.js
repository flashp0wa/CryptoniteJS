const sql = require('mssql');
const {DatabaseLog} = require('../Toolkit/Logger');
const {once} = require('events');

// #region config
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
  },
  pool: {
    max: Number(process.env.DB_MAX_POOL),
    min: 0,
  },
};

// #endregion
let pool;
let poolConnect;

if (!pool) {
  (async () => {
    try {
      pool = new sql.ConnectionPool(config);
      poolConnect = pool.connect();
      DatabaseLog.log({
        level: 'info',
        message: 'Connection to database has been succesfully established',
        senderFunction: 'IIF',
        file: 'SQLConnector.js',
      });
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `The following database error occured while creating pool. ${error.stack}`,
        senderFunction: 'IIF',
        file: 'SQLConnector.js',
        discord: 'database-errors',
      });
      process.exit();
    }
  })();
};

/**
 *
 * Close connection to database at application close
 */
const closePool = () => {
  pool.close();
  DatabaseLog.log({
    level: 'info',
    message: 'Database connection has been closed',
    senderFunction: 'closePool',
    file: 'SQLConnector.js',
  });
};

/**
 * Sends and email when database error occures and exits the application
 */
pool.once('error', (error) => {
  DatabaseLog.log({
    level: 'error',
    message: `The following database error occured: ${error.stack}`,
    senderFunction: 'poolOnce',
    file: 'SQLConnector.js',
    discord: 'database-errors',
  });
  process.exit();
});

const streamRead = async (query, callbFunction, callbFunctionOnDone) => {
  /*
  Payload

  [
  {
    CloseTime: 2021-09-01T23:59:59.999Z,
    ClosePrice: 2.869,
    Volume: 196563544.1,
    Symbol: 'ADAUSDT   '
  },
  ]
  */
  try {
    await poolConnect;

    let rowsToProcess = [];
    let rowsProcessed = 0;

    const request = new sql.Request(pool);
    request.stream = true;
    request.query(query);
    request.on('row', async (row) => {
      rowsToProcess.push(row);
      if (rowsToProcess.length >= 15) {
        request.pause();
        try {
          await callbFunction(rowsToProcess);
        } catch (error) {
          DatabaseLog.log({
            level: 'error',
            message: `Error in running stream read callback function ${error.stack}`,
            senderFunction: 'streamRead',
            file: 'SQLConnector.js',
            discord: 'database-errors',
          });
        }
        rowsProcessed += rowsToProcess.length;
        rowsToProcess = [];
        request.resume();
      }
    });
    request.on('done', async () => {
      rowsProcessed += rowsToProcess.length;
      console.log(`Processed rows: ${rowsProcessed}`);
    });
    await once(request, 'done');
    const returnValue = await callbFunctionOnDone(rowsToProcess);
    return returnValue;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `An error occured while stream reading from the database. ${error.stack}`,
      senderFunction: 'streamRead',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const singleRead = async (query) => {
  /*
  Payload

  {
  recordsets: [ [ [Object] ] ],
  recordset: [ { symbol: 'ADAUSDT' } ],
  output: {},
  rowsAffected: [ 1 ]
}
  */

  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: `Reading from database. Query: ${query}`,
      senderFunction: 'singleRead',
      file: 'SQLConnector.js',
    });
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `An error occured while reading from the database: ${error.stack}`,
      senderFunction: 'singleRead',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};

const sproc_ImportBinanceCsv = async (symbol, timeFrame, path) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure sproc_ImportBinanceCsv',
      senderFunction: 'sproc_ImportBinanceCsv',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', symbol)
        .input('timeFrame', timeFrame)
        .input('path', path)
        .execute('ImportBinanceCsv');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_ImportBinanceCsv'. ${error.stack}`,
      senderFunction: 'sproc_ImportBinanceCsv',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_AddSymbolToDatabase = async (symbol, exchangeId) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure sproc_AddSymbolToDatabase');
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure sproc_AddSymbolToDatabase',
      senderFunction: 'sproc_AddSymbolToDatabase',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', symbol)
        .input('exchangeId', exchangeId)
        .execute('AddSymbolToDatabase');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_AddSymbolToDatabase'. ${error}`,
      senderFunction: 'sproc_AddSymbolToDatabase',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_UpdateOrder = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure sproc_UpdateOrder',
      senderFunction: 'sproc_UpdateOrder',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('filled', inObj.filled)
        .input('cost', inObj.cost )
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('orderId', inObj.orderId)
        .input('fee', inObj.fee)
        .input('exchangeId', inObj.exchangeId)
        .input('updateTime', inObj.updateTime)
        .execute('UpdateOrder');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_UpdateOrder'. Object: ${inObj} ${error.stack}`,
      senderFunction: 'sproc_UpdateOrder',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_InsertIntoOrder = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stroed procedure Insert Into Order',
      senderFunction: 'sproc_InsertIntoOrder',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('updateTime', inObj.updateTime)
        .input('orderId', inObj.orderId)
        .input('eventTime', inObj.eventTime)
        .input('orderType', inObj.orderType)
        .input('side', inObj.side)
        .input('price', inObj.price)
        .input('stopPrice', inObj.stopPrice)
        .input('timeInForce', inObj.timeInForce)
        .input('postOnly', inObj.postOnly)
        .input('reduceOnly', inObj.reduceOnly)
        .input('priceProtect', inObj.priceProtect)
        .input('workingType', inObj.workingType)
        .input('positionSide', inObj.positionSide)
        .input('amount', inObj.amount)
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('cost', inObj.cost)
        .input('exchange', inObj.exchange)
        .input('filled', inObj.filled)
        .input('remaining', inObj.remaining)
        .input('fee', inObj.fee)
        .input('oco', inObj.oco)
        .input('ocoLimitId', inObj.ocoLimitId)
        .input('ocoStopLossLimitId', inObj.ocoLimitId)
        .input('parentOrderId', inObj.parentOrderId)
        .input('siblingOrderId', inObj.siblingOrderId)
        .input('strategy', inObj.strategy)
        .execute('InsertIntoOrder');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_InsertIntoOrder' Object: ${inObj}. ${error.stack}`,
      senderFunction: 'sproc_InsertIntoOrder',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_InsertIntoOrderFailed = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stroed procedure Insert Into OrderFailed',
      senderFunction: 'sproc_InsertIntoOrderPaperFailed',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('orderType', inObj.type)
        .input('side', inObj.side)
        .input('price', inObj.price)
        .input('stopPrice', inObj.stopPrice)
        .input('amount', inObj.orderAmount)
        .input('exchange', inObj.exchange)
        .input('limitPrice', inObj.limitPrice)
        .input('strategy', inObj.strategy)
        .input('reason', inObj.reason)
        .execute('InsertIntoOrderFailed');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_InsertIntoOrderFailed' Object: ${inObj}. ${error.stack}`,
      senderFunction: 'sproc_InsertIntoOrderFailed',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_InsertIntoOrderPaper = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stroed procedure Insert Into OrderPaper',
      senderFunction: 'sproc_InsertIntoOrderPaper',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('orderType', inObj.type)
        .input('side', inObj.side)
        .input('price', inObj.price)
        .input('stopPrice', inObj.stopPrice)
        .input('amount', inObj.orderAmount)
        .input('exchange', inObj.exchange)
        .input('limitPrice', inObj.limitPrice)
        .input('strategy', inObj.strategy)
        .execute('InsertIntoOrderPaper');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_InsertIntoOrderPaper' Object: ${inObj}. ${error.stack}`,
      senderFunction: 'sproc_InsertIntoOrderPaper',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_InsertIntoAverageTrueRange = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure Insert Into Average True Range',
      senderFunction: 'sproc_InsertIntoAverageTrueRange',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('eventTime', inObj.eventTime)
        .input('symbol', inObj.symbol)
        .input('timeFrame', inObj.timeFrame)
        .input('atr', inObj.atr)
        .execute('InsertIntoAverageTrueRange');

    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_InsertIntoAverageTrueRange' Object: ${inObj}. ${error.stack}`,
      senderFunction: 'sproc_InsertIntoAverageTrueRange',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_InsertIntoSupportResistance = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure Insert Into Support Resistance',
      senderFunction: 'sproc_InsertIntoSupportResistance',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('eventTime', inObj.eventTime)
        .input('symbol', inObj.symbol)
        .input('timeFrame', inObj.timeFrame)
        .input('support', inObj.support)
        .input('resistance', inObj.resistance)
        .execute('InsertIntoSupportResistance');
    return request;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_InsertIntoSupportResistance'. Object: ${inObj} ${error.stack}`,
      senderFunction: 'sproc_InsertIntoSupportResistance',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
const sproc_GatherSymbolTAData = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.log({
      level: 'silly',
      message: 'Running stored procedure Gather Symbol TA Data',
      senderFunction: 'sproc_GatherSymbolTAData',
      file: 'SQLConnector.js',
    });
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('timeFrame', inObj.timeFrame)
        .input('dataPeriod', inObj.dataPeriod)
        .input('macdDataPeriod', inObj.macdDataPeriod)
        .input('aroonDataPeriod', inObj.aroonDataPeriod)
        .input('eventTime', inObj.eventTime)
        .output('smaOut', sql.Decimal(19, 8))
        .output('emaOut', sql.Decimal(19, 8))
        .output('supportOut', sql.Decimal(19, 8))
        .output('resistanceOut', sql.Decimal(19, 8))
        .output('aroonUpOut', sql.Decimal(19, 8))
        .output('aroonDownOut', sql.Decimal(19, 8))
        .output('adiOut', sql.Decimal(19, 8))
        .output('adxOut', sql.Decimal(19, 8))
        .output('macdOut', sql.Decimal(19, 8))
        .output('obvOut', sql.Decimal(19, 8))
        .output('rsiOut', sql.Decimal(19, 8))
        .output('lastPriceOut', sql.Decimal(19, 8))
        .execute('GatherSymbolTAData');

    return request.output;
  } catch (error) {
    DatabaseLog.log({
      level: 'error',
      message: `Encountered an error running 'sproc_GatherSymbolTAData. Object: ${inObj} ${error.stack}`,
      senderFunction: 'sproc_GatherSymbolTAData',
      file: 'SQLConnector.js',
      discord: 'database-errors',
    });
  }
};
// #endregion


module.exports = {
  streamRead,
  singleRead,
  sproc_GatherSymbolTAData,
  sproc_ImportBinanceCsv,
  sproc_AddSymbolToDatabase,
  sproc_InsertIntoOrder,
  sproc_InsertIntoOrderPaper,
  sproc_InsertIntoOrderFailed,
  sproc_InsertIntoAverageTrueRange,
  sproc_InsertIntoSupportResistance,
  sproc_UpdateOrder,
  closePool,
};
