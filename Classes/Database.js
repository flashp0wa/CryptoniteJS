const sql = require('mssql');
const {DatabaseLog} = require('../Toolkit/Logger');
const {once} = require('events');

class Database {
  constructor() {
    this.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      requestTimeout: Number(process.env.DB_REQUEST_TIMEOUT),
      options: {
        trustServerCertificate: true,
      },
      pool: {
        max: Number(process.env.DB_MAX_POOL),
        min: 1,
        idleTimeoutMillis: Number(process.env.DB_REQUEST_TIMEOUT),
        acquireTimeoutMillis: Number(process.env.DB_REQUEST_TIMEOUT),
        createTimeoutMillis: Number(process.env.DB_REQUEST_TIMEOUT),
        destroyTimeoutMillis: Number(process.env.DB_REQUEST_TIMEOUT),
        reapIntervalMillis: Number(process.env.DB_REQUEST_TIMEOUT),
        createRetryIntervalMillis: Number(process.env.DB_REQUEST_TIMEOUT),
      },
    };
    this.pool;
    this.poolConnect;
  }

  async connect() {
    try {
      this.pool = new sql.ConnectionPool(this.config);
      this.poolConnect = this.pool.connect();
      DatabaseLog.log({
        level: 'info',
        message: 'Connection to database has been succesfully established',
        senderFunction: 'IIF',
        file: 'Database.js',
      });

      this.pool.once('error', (error) => {
        DatabaseLog.log({
          level: 'error',
          message: `The following database error occured: ${error.stack}`,
          senderFunction: 'poolOnce',
          file: 'Database.js',
          discord: 'database-errors',
        });
        process.exit();
      });
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `The following database error occured while creating pool. ${error.stack}`,
        senderFunction: 'IIF',
        file: 'Database.js',
        discord: 'database-errors',
      });
      process.exit();
    }
  }

  disconnect() {
    this.pool.close();
    DatabaseLog.log({
      level: 'info',
      message: 'Database connection has been closed',
      senderFunction: 'closePool',
      file: 'Database.js',
    });
  }

  streamRead = async (query, callbFunction, callbFunctionOnDone) => {
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
      await this.poolConnect;

      let rowsToProcess = [];

      const request = new sql.Request(this.pool);
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
              file: 'Database.js',
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
      });
      await once(request, 'done');
      const returnValue = await callbFunctionOnDone(rowsToProcess);
      return returnValue;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `An error occured while stream reading from the database. ${error.stack}`,
        senderFunction: 'streamRead',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  singleRead = async (query) => {
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
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: `Reading from database. Query: ${query}`,
        senderFunction: 'singleRead',
        file: 'Database.js',
      });
      const result = await this.pool.request().query(query);
      return result.recordset;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `An error occured while reading from the database: ${error.stack}`,
        senderFunction: 'singleRead',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_ImportBinanceCsv = async (symbol, timeFrame, path) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure sproc_ImportBinanceCsv',
        senderFunction: 'sproc_ImportBinanceCsv',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_AddSymbolToDatabase = async (symbol, exchangeId) => {
    try {
      await this.poolConnect;
      DatabaseLog.silly('Running stored procedure sproc_AddSymbolToDatabase');
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure sproc_AddSymbolToDatabase',
        senderFunction: 'sproc_AddSymbolToDatabase',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('symbol', symbol)
          .input('exchangeId', exchangeId)
          .execute('AddSymbolToDatabase');

      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_AddSymbolToDatabase'. ${error}`,
        senderFunction: 'sproc_AddSymbolToDatabase',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_RunTechnicalAnalysis = async () => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure sproc_RunTechnicalAnalysis',
        senderFunction: 'sproc_RunTechnicalAnalysis',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .execute('RunTechnicalAnalysis');

      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_RunTechnicalAnalysis'. ${error.stack}`,
        senderFunction: 'sproc_RunTechnicalAnalysis',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_UpdateOrder = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure sproc_UpdateOrder',
        senderFunction: 'sproc_UpdateOrder',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        message: `Encountered an error running 'sproc_UpdateOrder'. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_UpdateOrder',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoKlines = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stroed procedure Insert Into Klines',
        senderFunction: 'sproc_InsertIntoKlines',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('openTime', inObj.openTime)
          .input('openPrice', inObj.openPrice)
          .input('highPrice', inObj.highPrice)
          .input('lowPrice', inObj.lowPrice)
          .input('closePrice', inObj.closePrice)
          .input('volume', inObj.volume)
          .input('closeTime', inObj.closeTime)
          .input('quoteAssetVolume', inObj.quoteAssetVolume)
          .input('numberOfTrades', inObj.numberOfTrades)
          .input('takerBuyBaseAssetVolume', inObj.takerBuyBaseAssetVolume)
          .input('takerBuyQuoteAssetVolume', inObj.takerBuyQuoteAssetVolume)
          .input('ignore', inObj.ignore)
          .input('timeFrame', inObj.timeFrame)
          .input('symbol', inObj.symbol)
          .input('candleTypeId', inObj.candleTypeId)
          .output('symbolId', sql.Int)
          .output('timeFrameId', sql.Int)
          .output('accDistIndicator', sql.Decimal(19, 2))
          .output('aroonUp14', sql.SmallInt)
          .output('aroonDown14', sql.SmallInt)
          .output('aroonUp25', sql.SmallInt)
          .output('aroonDown25', sql.SmallInt)
          .output('avgDirIndx', sql.Decimal(4, 2))
          .output('support', sql.Decimal(19, 8))
          .output('resistance', sql.Decimal(19, 8))
          .output('atr50', sql.Decimal(19, 8))
          .output('bollUpBand30', sql.Decimal(19, 8))
          .output('bollDownBand30', sql.Decimal(19, 8))
          .output('bollWidthBand30', sql.Decimal(19, 8))
          .output('ema50', sql.Decimal(19, 8))
          .output('ema9', sql.Decimal(19, 8))
          .output('ema200', sql.Decimal(19, 8))
          .output('ema10', sql.Decimal(19, 8))
          .output('ema12', sql.Decimal(19, 8))
          .output('ema26', sql.Decimal(19, 8))
          .output('macd1226', sql.Decimal(19, 8))
          .output('rsi', sql.Decimal(19, 8))
          .output('sma10', sql.Decimal(19, 8))
          .output('sma20', sql.Decimal(19, 8))
          .output('sma30', sql.Decimal(19, 8))
          .output('sma50', sql.Decimal(19, 8))
          .output('sma100', sql.Decimal(19, 8))
          .output('sma200', sql.Decimal(19, 8))
          .output('stoFastSmooth', sql.Decimal(19, 8))
          .output('stoSlowSmooth', sql.Decimal(19, 8))
          .output('willFracBuy', sql.Bit)
          .output('willFracSell', sql.Bit)
          .execute('InsertIntoKlines');

      return request.output;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_InsertIntoKlines' Object: ${JSON.stringify(inObj)}. ${error.stack}`,
        senderFunction: 'sproc_InsertIntoOrder',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoOrder = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stroed procedure Insert Into Order',
        senderFunction: 'sproc_InsertIntoOrder',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
          .input('timeFrame', inObj.timeFrame)
          .input('leverage', inObj.leverage)
          .execute('InsertIntoOrder');

      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_InsertIntoOrder' Object: ${JSON.stringify(inObj)}. ${error.stack}`,
        senderFunction: 'sproc_InsertIntoOrder',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoOrderFailed = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stroed procedure Insert Into OrderFailed',
        senderFunction: 'sproc_InsertIntoOrderPaperFailed',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        message: `Encountered an error running 'sproc_InsertIntoOrderFailed' Object: ${JSON.stringify(inObj)}. ${error.stack}`,
        senderFunction: 'sproc_InsertIntoOrderFailed',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoOrderPaper = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stroed procedure Insert Into OrderPaper',
        senderFunction: 'sproc_InsertIntoOrderPaper',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        message: `Encountered an error running 'sproc_InsertIntoOrderPaper' Object: ${JSON.stringify(inObj)}. ${error.stack}`,
        senderFunction: 'sproc_InsertIntoOrderPaper',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoAverageTrueRange = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Insert Into Average True Range',
        senderFunction: 'sproc_InsertIntoAverageTrueRange',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('eventTime', inObj.eventTime)
          .input('symbol', inObj.symbol)
          .input('timeFrame', inObj.timeFrame)
          .input('atr', inObj.atr)
          .execute('InsertIntoAverageTrueRange');

      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_InsertIntoAverageTrueRange' Object: ${JSON.stringify(inObj)}. ${error.stack}`,
        senderFunction: 'sproc_InsertIntoAverageTrueRange',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoSupportResistance = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Insert Into Support Resistance',
        senderFunction: 'sproc_InsertIntoSupportResistance',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        message: `Encountered an error running 'sproc_InsertIntoSupportResistance'. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_InsertIntoSupportResistance',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_InsertIntoSystemStateSupportOrder = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Insert Into System State Support Order',
        senderFunction: 'sproc_InsertIntoSystemStateSupportOrder',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('symbolName', inObj.symbolName)
          .input('exchangeName', inObj.exchangeName)
          .input('orderSideName', inObj.orderSideName)
          .input('orderTypeName', inObj.orderTypeName)
          .input('strategyName', inObj.strategyName)
          .input('orderAmount', inObj.orderAmount)
          .input('price', inObj.orderPrice)
          .input('stopPrice', inObj.stopPrice)
          .input('limitPrice', inObj.limitPrice)
          .input('orderId', inObj.orderId)
          .execute('InsertIntoSystemStateSupportOrder');
      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_InsertIntoSystemStateSupportOrder'. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_InsertIntoSystemStateSupportOrder',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_DeleteFromSystemStateSupportOrder = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Delete From System State Support Order',
        senderFunction: 'sproc_DeleteFromSystemStateSupportOrder',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('orderId', inObj.orderId)
          .execute('DeleteFromSystemStateSupportOrder');
      return request;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_DeleteFromSystemStateSupportOrder'. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_DeleteFromSystemStateSupportOrder',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
  sproc_GatherSymbolTAData = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Gather Symbol TA Data',
        senderFunction: 'sproc_GatherSymbolTAData',
        file: 'Database.js',
      });
      const request = await this.pool.request()
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
        message: `Encountered an error running 'sproc_GatherSymbolTAData. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_GatherSymbolTAData',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };

  sproc_SwitchTradeMode = async (inObj) => {
    try {
      await this.poolConnect;
      DatabaseLog.log({
        level: 'silly',
        message: 'Running stored procedure Switch Trade Mode',
        senderFunction: 'sproc_SwitchTradeMode',
        file: 'Database.js',
      });
      const request = await this.pool.request()
          .input('getValue', inObj.getValue)
          .output('returnValue', sql.VarChar(5))
          .execute('SwitchTradeMode');
      return request.output;
    } catch (error) {
      DatabaseLog.log({
        level: 'error',
        message: `Encountered an error running 'sproc_SwitchTradeMode. Object: ${JSON.stringify(inObj)} ${error.stack}`,
        senderFunction: 'sproc_SwitchTradeMode',
        file: 'Database.js',
        discord: 'database-errors',
      });
    }
  };
}

let database = new Database();
/**
 * Creates the Exchanges class if does not exists and returns it. If already exists returns it.
 * @return {class} Exchanges class object
 */
function getDatabase() {
  if (!database) {
    return database = new Database();
  } else {
    return database;
  }
}

module.exports = {
  Database,
  getDatabase,
};
