// require('dotenv').config({path: '.env'});
const WebSocket = require('websocket').w3cwebsocket;
const ProcessStream = require('../ProcessStream.js');
const {ApplicationLog} = require('../../Toolkit/Logger.js');
// const sendMail = require('../../Toolkit/Mailer.js');
// const {ReturnEmitter} = require('../../Loaders/EventEmitter.js');


const streamsToListen = [
  'btcusdt@kline_1m',
  // 'btcusdt@ticker',
  // 'ethusdt@ticker',
];

/**
 *
 * @param {array} streams // Symbol array
 */
function streamKicker(streams) {
  // Build URL
  let url;
  const baseUrl = process.env.BNC_WSS_URL;

  if (!streams) {
    ApplicationLog.error('No streams have been defined. Could not build URL.');
    throw new Error('No streams have been defined.');
  } else if (streams.length === 1) {
    url = baseUrl + 'ws/' + streams;
  } else {
    url = `${baseUrl}stream?streams=`;
    for (let index = 0; index < streams.length; index++) {
      url += streams[index] + '/';
      // Do not place forward slash at the end of the URL
      if (streams.length === index + 1) {
        url += streams[index];
      }
    }
  }

  ApplicationLog.info('URL build succeeded');
  ApplicationLog.info(`Stream URL: ${url}`);

  const ws = new WebSocket(url);

  // Connection established message
  ws.onopen = () => {
    ApplicationLog.info('Connection established with the stream server');
  };

  // Data received from server as string...
  // Making it JSON and writing to database
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // console.log(data);
    ProcessStream.wssJsonStream2Object(data);
  };
  // Connection closed. Will try reconnecting
  ws.onclose = () => {
    ApplicationLog.info('Stream connection has been closed... trying to reconnect');
    setTimeout(() => {
      restartStream();
    }, 3);
  };

  // Error establishing connection
  ws.onerror = (error) => {
    ApplicationLog.error(`Connection could not be established with the stream server. Message: ${error.message}. Type: ${error.name}`);
    throw new Error(`Connection could not be established: ${error.message}`);
  };
}

/**
 *
 */
function startStream() {
  streamKicker(streamsToListen);
}
/**
 *
 */
function restartStream() {
  ApplicationLog.info('Stream restart initiated');
  streamKicker(streamsToListen);
}

startStream();

module.exports = {
  startStream,
  restartStream,
};
