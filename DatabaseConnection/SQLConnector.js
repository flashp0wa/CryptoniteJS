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
// Close connection at application close
const closePool = () => {
  pool.close();
  DatabaseLog.info('Connection pool closed.');
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

const sproc_TTQAV = async (symbol, dateBegin, dateEnd) => {
  try {
    await poolConnect;
    DatabaseLog.silly(
        `Running stored procedure TotalTradedQuoteAssetVolume
        with parameters => 
        Symbol: ${symbol},
        Start date: ${dateBegin},
        End date: ${dateEnd}`);
    const request = await pool.request()
        .input('symbol', symbol)
        .input('dateBegin', dateBegin)
        .input('dateEnd', dateEnd)
        .output('lowestVolumeOut', pool.Money)
        .output('highestVolumeOut', pool.Money)
        .output('averageVolumeOut', pool.Money)
        .execute('count_TotalTradedQuoteAssetVolume');

    return request;
  } catch (error) {
    DatabaseLog.info(`Encountered an error running stored procedure. ${error.stack}`);
  }
};

const sproc_SMA = async (symbol, dateBegin, dateEnd) => {
  try {
    await poolConnect;
    DatabaseLog.silly(
        `Running stored procedure SimpleMovingAverage with parameters =>
        Symbol: ${symbol},
        Start date: ${dateBegin},
        End date: ${dateEnd}`);
    const request = await pool.request()
        .input('symbol', symbol)
        .input('dateBegin', dateBegin)
        .input('dateEnd', dateEnd)
        .output('SMAOut', pool.Money)
        .execute('count_SimpleMovingAverage');

    return request;
  } catch (error) {
    DatabaseLog.error(`Encountered an error running stored procedure. ${error.stack}`);
  }
};

// #endregion


module.exports = {
  writeToDatabase,
  streamRead,
  singleRead,
  sproc_TTQAV,
  sproc_SMA,
  closePool,
  selectEverythingFrom,
  selectColumnsFrom,
  updateTable,
};
