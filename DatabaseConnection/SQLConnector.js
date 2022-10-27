const sql = require('mssql');
const {DatabaseLog} = require('../Toolkit/Logger.js');
const {once} = require('events');
const {returnEmitter} = require('../Loaders/EventEmitter.js');

// #region config
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
  },
};

// #endregion
let pool;
let poolConnect;
const globalEvent = returnEmitter();
/*
Prevents multiple pool creation.
Once any of the functions will be called,
connecection pool will be created,
so connection can be kept alive till the application is running.
*/
if (!pool) {
  (async () => {
    try {
      pool = new sql.ConnectionPool(config);
      poolConnect = pool.connect();
      DatabaseLog.info('Connection pool has been created');
    } catch (error) {
      DatabaseLog.error(`The following database error occured while creating pool. ${error.stack}`);
      process.exit();
    }
  })();
};

// Close connection at application close
const closePool = () => {
  pool.close();
  DatabaseLog.info('Connection pool closed.');
};

pool.once('error', (error) => {
  DatabaseLog.error(`The following database error occured: ${error.stack}`);
  globalEvent.emit('SendEmail', `The following database error occured: ${error}`);
  process.exit();
});

// #region single I/O operations

/**
 *
 * @param {object} inObj // Keys: dataObj, table, statement, query?
 * @param {object} params // @ INSERT INTO {insertIntoAll: true || false}
 * @return {object} result
 */
const writeToDatabase = async (inObj) => {
  try {
    await poolConnect; // ensures that the pool has been created
  } catch (error) {
    DatabaseLog.error(`Connection pool could not be created. ${error.stack}`);
  }
  const request = pool.request();
  let query;
  switch (inObj.statement) {
    case 'INSERT INTO':
      try {
        query = `INSERT INTO ${inObj.table} `;
        let tableColumn = '(';
        let values = ' VALUES (';

        for (const column of Object.keys(inObj.dataObj)) {
          tableColumn += `${column},`;
          values += `\'${inObj.dataObj[column]}\',`;
        }

        tableColumn = tableColumn.slice(0, -1);
        tableColumn += ')';
        values = values.slice(0, -1);
        values += ')';

        query += `${tableColumn} ${values}`;

        DatabaseLog.info(`Writing to database. Query: ${query}`);
        const result = await request.query(query);
        return result;
      } catch (error) {
        DatabaseLog.error(`SQLConnector : An error occured while 'INSERT INTO' to database. ${error.stack}`);
      }
      break;
    case 'QUERY':
      try {
        const result = await request.query(inObj.query);
        return result;
      } catch (error) {
        DatabaseLog.error(`SQLConnector : An error occured while running query. ${error.stack}`);
      }
      break;
    default:
      break;
  }
};

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
          DatabaseLog.error(`Error in running stream read callback function ${error.stack}`);
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
    DatabaseLog.error(`An error occured while stream reading from the database. ${error.stack}`);
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
    DatabaseLog.silly(`Reading from database. Query: ${query}`);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    DatabaseLog.error(`An error occured while reading from the database: ${error}`);
  }
};


async function selectEverythingFrom(tableName, where) {
  try {
    await poolConnect;
    let query;
    if (!where) {
      query = `SELECT * FROM ${tableName}`;
    } else {
      query = `SELECT * FROM ${tableName} WHERE ${where}`;
    }
    DatabaseLog.silly(`Reading from database. Query: ${query}`);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    DatabaseLog.error(`An error occured while reading from the database: ${error.stack}`);
  }
}
/**
 *
 * @param {string} tableName|
 * @param {string} columns // comma separated string value (value1, value2)
 * @param {string} where // columnName='stuff'
 * @return {object}
 */
async function selectColumnsFrom(tableName, columns, where) {
  try {
    await poolConnect;
    let query;
    if (!where) {
      query = `SELECT ${columns} FROM ${tableName}`;
    } else {
      query = `SELECT ${columns} FROM ${tableName} WHERE ${where}`;
    }
    DatabaseLog.silly(`Reading from database. Query: ${query}`);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    DatabaseLog.error(`An error occured while reading from the database: ${error.stack}`);
  }
}

async function updateTable(tableName, set, where) {
  try {
    await poolConnect;
    const query = `UPDATE ${tableName} SET ${set} WHERE ${where}`;
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    DatabaseLog.error(`An error occured while updating table: ${error}`);
  }
}


// #endregion
// #region stored procedures

const sproc_ImportBinanceCsv = async (symbol, timeFrame, path) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Import Binance Csv');
    const request = await pool.request()
        .input('symbol', symbol)
        .input('timeFrame', timeFrame)
        .input('path', path)
        .execute('ImportBinanceCsv');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_AddSymbolToDatabase = async (symbol, exchangeId) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Add Symbol');
    const request = await pool.request()
        .input('symbol', symbol)
        .input('exchangeId', exchangeId)
        .execute('AddSymbolToDatabase');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_UpdateOrderBuy = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Add Symbol');
    const request = await pool.request()
        .input('fee', inObj.fee)
        .input('cost', inObj.cost )
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('orderId', inObj.orderId)
        .execute('UpdateOrderBuy');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_UpdateOrderSell = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Add Symbol');
    const request = await pool.request()
        .input('fee', inObj.fee)
        .input('cost', inObj.cost )
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('orderId', inObj.orderId)
        .input('filled', inObj.filled)
        .execute('UpdateOrderSell');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_InsertIntoOrderBuy = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Insert Into Order Buy');
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('orderId', inObj.orderId)
        .input('eventTime', inObj.eventTime)
        .input('orderType', inObj.orderType)
        .input('side', inObj.side)
        .input('price', inObj.price)
        .input('amount', inObj.amount)
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('cost', inObj.cost)
        .input('exchange', inObj.exchange)
        .input('filled', inObj.filled)
        .input('remaining', inObj.remaining)
        .input('fee', inObj.fee)
        .input('ocoLimitId', inObj.ocoLimitId)
        .input('ocoStopLossLimitId', inObj.ocoStopLossLimitId)
        .execute('InsertIntoOrderBuy');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_InsertIntoOrderSell = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Insert Into Order Buy');
    const request = await pool.request()
        .input('symbol', inObj.symbol)
        .input('orderId', inObj.orderId)
        .input('eventTime', inObj.eventTime)
        .input('orderType', inObj.orderType)
        .input('side', inObj.side)
        .input('price', inObj.price)
        .input('amount', inObj.amount)
        .input('orderStatus', inObj.orderStatus)
        .input('tradeStatus', inObj.tradeStatus)
        .input('cost', inObj.cost)
        .input('exchange', inObj.exchange)
        .input('filled', inObj.filled)
        .input('remaining', inObj.remaining)
        .input('fee', inObj.fee)
        .input('stopPrice', inObj.stopPrice)
        .input('parentOrderId', inObj.parentOrderId)
        .input('siblingOrderId', inObj.siblingOrderId)
        .execute('InsertIntoOrderSell');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
const sproc_GatherSymbolTAData = async (inObj) => {
  try {
    await poolConnect;
    DatabaseLog.silly('Running stored procedure Gather Symbol TA Data');
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
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};
// #endregion


module.exports = {
  writeToDatabase,
  streamRead,
  singleRead,
  sproc_GatherSymbolTAData,
  sproc_ImportBinanceCsv,
  sproc_AddSymbolToDatabase,
  sproc_InsertIntoOrderBuy,
  sproc_InsertIntoOrderSell,
  sproc_UpdateOrderBuy,
  sproc_UpdateOrderSell,
  closePool,
  selectEverythingFrom,
  selectColumnsFrom,
  updateTable,
};
