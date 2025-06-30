const {WebSocketServer} = require('ws');
const {ApplicationLog} = require('../Toolkit/Logger');
const {getTechnicalIndicators} = require('./TechnicalIndicatorClass');

class CryptoniteWebSocketServer {
  constructor() {
    this.technicalIndicator = getTechnicalIndicators();
    this.lastWssMessageTimestamp;
    this.wssServer = new WebSocketServer({port: process.env.WSS_SERVER_PORT});
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
}
const cws = new CryptoniteWebSocketServer();
function getServer() {
  if (!cws) {
    return cws = new CryptoniteWebSocketServer();
  } else {
    return cws;
  }
}

module.exports = {
  CryptoniteWebSocketServer,
  getServer,
};
