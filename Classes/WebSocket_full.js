const {WebSocketServer, WebSocket} = require('ws');
const {ApplicationLog} = require('../Toolkit/Logger');
const {getDatabase} = require('./Database');
const {getTechnicalIndicators} = require('./TechnicalIndicatorClass');
const {getExchanges} = require('./Exchanges/ExchangesClass');

class CryptoniteWebSocket {
  constructor() {
    this.db = getDatabase();
    this.technicalIndicator = getTechnicalIndicators();
    this.lastWssMessageTimestamp;
    this.wssServer = new WebSocketServer({port: process.env.WSS_SERVER_PORT});
    this.isWsStreamOn = false;
    this.isWsServerOn = false;
  }
  startServer() {
    ApplicationLog.log({
      level: 'info',
      message: 'Starting web socket server',
      senderFunction: 'StartServer',
      file: 'WebSocket.js',
    });
    this.isWsServerOn = true;

    this.wssServer.on('connection', function connection(ws) {
      ws.on('error', function logError() {
        ApplicationLog.error({
          level: 'info',
          message: `WSS Server error. ${console.error}`,
          senderFunction: 'StartServer',
          file: 'WebSocket.js',
        });
      });
      ApplicationLog.info({
        level: 'info',
        message: 'New WSS server connection.',
        senderFunction: 'wssServer.on',
        file: 'WebSocket.js',
      });

      //   ws.on('message', function message(data) {
      //     console.log('received: %s', data);
      //   });

      ws.on('close', function terminate() {
        ws.terminate();
      });
    });
  }

  sendMessage(msg) {
    this.wssServer.clients.forEach(function each(client) {
      client.send(msg);
    });
  }

  async connectToBinance() {
    const excObj = getExchanges()['binanceFutures'].excObj;

    /**
         * Checks for missing kline data between last database entry and current application run time.
         * @param {array} streams
         * @return {promise} // Resolves true if success, false if fail.
         */
    const dataIntegrityCheck = async (streams) => {
      return new Promise(async (resolve, reject) => {
        ApplicationLog.log({
          level: 'info',
          message: 'Data integrity check started',
          senderFunction: 'dataIntegrityCheck',
          file: 'WebSocket.js',
        });

        for (const stream of streams) {
          if (stream.includes('kline')) {
            const symbol = stream.split('@')[0].toUpperCase();
            const timeframe = stream.split('_')[1];

            try {
              const response = await this.db.singleRead(`select * from itvf_GetLastKlineOpenTime('${symbol}', '${timeframe}')`);
              const lastKlineOpenTime = response[0].openTime;
              const since = new Date(lastKlineOpenTime).getTime();
              const klines = await excObj.publicGetKlines({
                symbol: symbol,
                interval: timeframe,
                startTime: since,
                endTime: new Date().getTime(),
              });

              if (klines.length === 2) {
                ApplicationLog.log({
                  level: 'info',
                  message: `No missing kline data for ${symbol} ${timeframe}`,
                  senderFunction: 'dataIntegrityCheck',
                  file: 'WebSocket.js',
                });
                continue;
              }

              let counter = 0;
              for (const kline of klines) {
                if (counter === 0 || counter === klines.length - 1) {
                  counter++;
                  continue; // The first kline is already in the database, the last is not closed yet.
                };
                const obj = klineResponse2Object(kline, symbol, timeframe);
                await this.db.sproc_InsertIntoKlines(obj);
                counter++;
              }
            } catch (error) {
              ApplicationLog.log({
                level: 'error',
                message: `There was an error while running data integrity check ${error}`,
                senderFunction: 'dataIntegrityCheck',
                file: 'WebSocket.js',
              });
              reject(new Error(`Failed to check data integrity ${error}`));
            }
          }
        }

        await this.db.sproc_RunTechnicalAnalysis();

        ApplicationLog.log({
          level: 'info',
          message: 'Data integrity check finished',
          senderFunction: 'dataIntegrityCheck',
          file: 'WebSocket.js',
        });
        resolve(true);
      });
    };
    const onMessage = (processedData) => {
      if (processedData.closed) {
        this.technicalIndicator.handleKline(processedData);
      }
      // this.strategy.run_srCandleTree(processedData);
    };

    try {
      let url;
      const baseUrl = process.env.BNC_WSS_URL;
      const exchangeId = 4;
      const rows = await this.db.singleRead(`select * from itvf_GetWss(${exchangeId})`);
      const streams = [];
      let wssCache = [];
      let dataIntegrityIsChecked = false;

      for (const row of rows) {
        streams.push(`${row.symbol.toLowerCase()}@${row.streamType}`);
      }

      if (streams.length === 1) {
        url = baseUrl + 'ws/' + streams;
      } else {
        url = `${baseUrl}stream?streams=`;
        for (let index = 0; index < streams.length; index++) {
          url += streams[index];
          // Do not place forward slash at the end of the URL
          if (streams.length !== index + 1) {
            url += '/';
          }
        }
      }
      ApplicationLog.log({
        level: 'info',
        message: `URL build succeeded. Stream URL: ${url}`,
        senderFunction: 'startWss',
        file: 'WebSocket.js',
      });

      const ws = new WebSocket(url);


      ws.onopen = () => {
        this.isWsStreamOn = true;
        ApplicationLog.log({
          level: 'info',
          message: 'Connection has been established with the stream server',
          senderFunction: 'startWss',
          file: 'WebSocket.js',
        });
      };

      ws.onclose = () => {
        this.isWsStreamOn = false;
        ApplicationLog.log({
          level: 'info',
          message: 'Stream connection has been closed... trying to reconnect',
          senderFunction: 'startWss',
          file: 'WebSocket.js',
        });
        setTimeout(() => {
          this.startWss();
        }, process.env.WSS_TIMEOUT_CONNECTION_REBUILD);
      };

      // Handle incoming messages
      ws.on('message', (data) => {
        this.lastWssMessageTimestamp = new Date();
        const dataObj = JSON.parse(data);
        const processedData = wssJsonStream2Object(dataObj);
        if (dataIntegrityIsChecked && this.technicalIndicator.isLoaded) {
          if (wssCache.length !== 0) {
            for (const klineObj of wssCache) {
              onMessage(klineObj);
              wssCache = [];
            }
          }
          onMessage(processedData);
        } else {
          wssCache.push(processedData);
        }
      });
      // Handle errors
      ws.on('error', function error(error) {
        ApplicationLog.log({
          level: 'info',
          message: `Connection could not be established with the stream server. ${error}`,
          senderFunction: 'startWss',
          file: 'WebSocket.js',
        });
      });

      // Check if there is any missing data in the database
      dataIntegrityIsChecked = await dataIntegrityCheck(streams);
      await this.technicalIndicator.loadValues();
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Web Socket Stream failed to start ${error.stack}`,
        senderFunction: 'startWss',
        file: 'WebSocket.js',
      });
      process.exit();
    }
  }
}
const cws = new CryptoniteWebSocket();
function getCryptoniteWebSocket() {
  if (!cws) {
    return cws = new CryptoniteWebSocket();
  } else {
    return cws;
  }
}

module.exports = {
  CryptoniteWebSocket,
  getCryptoniteWebSocket,
};
