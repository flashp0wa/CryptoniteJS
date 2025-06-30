const {WebSocket} = require('ws');
const {ApplicationLog} = require('../Toolkit/Logger');
const {getDatabase} = require('./Database');

class WebSocketClient {
  constructor(inObj) {
    this.db = getDatabase();
    this.lastWssMessageTimestamp;
    this.isWsStreamOn = false;
    this.isDataStreamOn = false;
    this.isWsServerOn = false;
    this.apiKey = inObj.apiKey;
    this.userDataStreamApiUrl = inObj.userDataStreamApiUrl;
    this.wssBaseUrl = inObj.wssBaseUrl;
    this.webSocketStreamUrl = inObj.wssUrl;
    this.excObjId = inObj.excObjId;
    this.exchangeName = inObj.exchange;
    this.isDataIntegrityChecked = false;
  }

  async startUserDataStream() {
    const res = await fetch(this.userDataStreamApiUrl, {
      method: 'POST',
      headers: {
        'x-mbx-apikey': this.apiKey,
      },
    });

    if (this.isDataStreamOn) return;

    const listenKey = await JSON.parse(await res.text()).listenKey;
    const ws = new WebSocket(this.wssBaseUrl + 'ws/' + listenKey);


    ws.onopen = () => {
      this.isDataStreamOn = true;
      ApplicationLog.log({
        level: 'info',
        message: `Successfully connected to ${this.exchangeName} user data stream`,
        senderFunction: 'startUserDataStream',
        file: 'WebSocketClient',
      });
    };

    ws.onclose = () => {
      this.isDataStreamOn = false;
      ApplicationLog.log({
        level: 'error',
        message: `User datastream connection closed on ${this.exchangeName}`,
        senderFunction: 'startUserDataStream',
        file: 'WebSocketClient',
      });
      this.startUserDataStream();
    };

    // Handle incoming messages
    ws.on('message', (data) => {
      this.db.pushJson(JSON.parse(data.toString()), 'X');
      console.log(`Message from ${this.userDataStreamApiUrl}`);
      console.log(JSON.parse(data.toString()));
    });

    // Handle errors
    ws.onerror = (error) => {
      ApplicationLog.log({
        level: 'error',
        message: `Failed to connect to ${this.exchangeName} user data stream. ${error.message}`,
        senderFunction: 'startUserDataStream',
        file: 'WebSocketClient',
      });
    };
  }

  async startWebSocketStream() {
    /**
    * Checks for missing kline data between last database entry and current application run time.
    * @param {kline} streams
    * @return {promise} // Resolves true if success, false if fail.
    */
    const dataIntegrityCheck = async () => {
      return new Promise(async (resolve, reject) => {
        ApplicationLog.log({
          level: 'info',
          message: 'Data integrity check started',
          senderFunction: 'dataIntegrityCheck',
          file: 'WebSocketClient',
        });

        const response = await this.db.singleRead(`select * from itvf_GetLastKlineOpenTime('${this.excObjId}')`);
        for (const stream of response) {
          try {
            const res = await this.excObj.publicGetKlines({
              symbol: stream.symbol,
              interval: stream.timeFrame,
              startTime: stream.startTime,
              endTime: stream.endTime,
            });
            const klines = res.slice(1, -1); // First data already in database, last not closed yet
            if (klines.length === 0) continue;
            const dbarray = [];
            for (const kline of klines) {
              dbarray.push({
                t: kline[0],
                T: kline[6],
                s: stream.symbol,
                i: stream.timeFrame,
                o: kline[1],
                c: kline[4],
                h: kline[2],
                l: kline[3],
                n: kline[8],
                q: kline[7],
                v: kline[5],
                v: kline[9],
                Q: kline[10],
                x: true,
              });
              this.db.pushJson(dbarray, 'NI_WebSocketStreamHandler');
            }
          } catch (error) {
            reject(new Error(`Failed to check data integrity ${error}`));
          }
        }
        // await this.db.sproc_RunTechnicalAnalysis();

        ApplicationLog.log({
          level: 'info',
          message: 'Data integrity check finished',
          senderFunction: 'dataIntegrityCheck',
          file: 'WebSocketClient',
        });
        resolve(true);
      });
    };

    try {
      let wssCache = [];
      const ws = new WebSocket(this.webSocketStreamUrl);

      ws.onopen = () => {
        this.isWsStreamOn = true;
        ApplicationLog.log({
          level: 'info',
          message: 'Connection has been established with the stream server',
          senderFunction: 'startWebSocketStream',
          file: 'WebSocketClient',
        });
      };

      ws.onclose = () => {
        this.isWsStreamOn = false;
        ApplicationLog.log({
          level: 'info',
          message: 'Stream connection has been closed... trying to reconnect',
          senderFunction: 'startWebSocketStream',
          file: 'WebSocketClient',
        });
        this.startWebSocketStream();
      };

      ws.on('message', (data) => {
        this.lastWssMessageTimestamp = new Date();
        if (this.isDataIntegrityChecked) {
          if (wssCache.length !== 0) {
            this.db.pushJson(wssCache, 'NI_WebSocketStreamHandler');
            wssCache = [];
          }
          this.db.pushJson(JSON.parse(data), 'NI_WebSocketStreamHandler');
        } else {
          wssCache.push(data);
        }
      });

      ws.on('error', function error(error) {
        ApplicationLog.log({
          level: 'info',
          message: `Connection could not be established with the stream server. ${error}`,
          senderFunction: 'startWebSocketStream',
          file: 'WebSocketClient',
        });
      });

      const dataIntegrityState = dataIntegrityCheck();
      dataIntegrityState.then((result) => {
        this.isDataIntegrityChecked = result;
      }).catch((error) => {
        ApplicationLog.log({
          level: 'error',
          message: `There was an error while running data integrity check ${error}`,
          senderFunction: 'dataIntegrityCheck',
          file: 'WebSocketClient',
        });
      });
    } catch (error) {
      ApplicationLog.log({
        level: 'error',
        message: `Web Socket Stream failed to start ${error.stack}`,
        senderFunction: 'startWebSocketStream',
        file: 'WebSocketClient',
      });
      process.exit();
    }
  }

  start() {
    if (this.userDataStreamApiUrl) this.startUserDataStream();
    if (this.webSocketStreamUrl) this.startWebSocketStream();
  }
}

module.exports = {
  WebSocketClient,
};
