const sql = require('mssql');
const {DatabaseLog} = require('../Toolkit/Logger.js');
const {once} = require('events');
const {returnEmitter} = require('../Loaders/EventEmitter.js');
// const { fail } = require('assert');

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
      DatabaseLog.error(`The following database error occured while creating pool. ${error}`);
      process.exit();
    }
  })();
};

pool.once('error', (error) => {
  DatabaseLog.error(`The following database error occured: ${error}`);
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
const writeToDatabase = async (inObj, params) => {
  await poolConnect; // ensures that the pool has been created
  const request = pool.request();
  let query;
  switch (inObj.statement) {
    case 'INSERT INTO':
      try {
        if (params.insertIntoAll === true) {
          query = `INSERT INTO ${inObj.table} VALUES (`;
          for (const key of Object.keys(inObj.dataObj)) {
            query += `\'${inObj[key]}\',`;
          }
          query = query.slice(0, -1);
          query += ')';
        } else {
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
        }
        DatabaseLog.silly(`Writing to database. Query: ${query}`);
        const result = await request.query(query);
        return result;
      } catch (error) {
        DatabaseLog.error(`SQLConnector : An error occured while 'INSERT INTO' to database. ${error}`);
      }
      break;
    case 'QUERY':
      try {
        const result = await request.query(inObj.query);
        return result;
      } catch (error) {
        DatabaseLog.error(`SQLConnector : An error occured while running query. ${error}`);
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
        await callbFunction(rowsToProcess);
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
    // eslint-disable-next-line max-len
    DatabaseLog.error(`An error occured while stream reading from the database. ${error}`);
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
    return result;
  } catch (error) {
    // eslint-disable-next-line max-len
    DatabaseLog.error(`An error occured while reading from the database: ${error}`);
  }
};
// Close connection at application close
const closePool = () => {
  pool.close();
  DatabaseLog.info('Connection pool closed.');
};

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
    DatabaseLog.info(`Encountered an error running stored procedure. ${error}`);
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
    DatabaseLog.info(`Encountered an error running stored procedure. ${error}`);
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
};
