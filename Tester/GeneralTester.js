// const {WebSocketServer} = require('ws');
const {WebSocket} = require('ws');
const wssurl = 'wss://stream.binance.com:9443/ws/';
const apiKey = 'vPL0c5L9Ij7BPhfnDIv4jdkH1CYol60ZU8qLmbe5NUWjPHnPxXyt34QAuz3Fze3L';
const secKey = 'dlMAaFTc3DHFPBeTtvamlwa98vACTpBicVK9BpKxkLgdD83AakoPc3MxSgkhNCgy';
const {createHash} = require('crypto');


// const wss = new WebSocketServer({port: 8080});

// wss.on('connection', function connection(ws) {
//   ws.on('error', console.error);

//   ws.on('message', function message(data) {
//     console.log('received: %s', data);
//   });
// });

// setInterval(() => {
//   wss.clients.forEach(function each(client) {
//       client.send('Juuuuhuuuu');
//   });
// }, 1000);


async function start(url, key) {
  const ws = new WebSocket(url + `${key}`);

  ws.onopen = () => {
    console.log(`Connected to ${url}`);
  };


  // Handle incoming messages
  ws.on('message', (data) => {
    console.log(`Message from ${url}`);
    console.log(JSON.parse(data.toString()));
  });
  // Handle errors
  ws.on('error', function error(error) {
    console.log(error);
  });
}

async function getListenKey(url) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'x-mbx-apikey': apiKey,
    },
  });
  const key = await JSON.parse(await res.text()).listenKey;
  return key;
}

async function binanceSpotDataStream() {
  const apibase = 'https://api.binance.com';
  const endpoint = '/api/v3/userDataStream';
  const fullurl = `${apibase}${endpoint}`;
  const key = await getListenKey(fullurl);
  console.log(key);
  start(wssurl, key);
}

async function binanceFuturesDataStream() {
  const apibase = 'https://fapi.binance.com';
  const hash = createHash('sha256').update(secKey).digest('hex');
  const endpoint = '/fapi/v1/listenKey';
  const timestamp = new Date().getTime();
  const fullurl = `${apibase}${endpoint}?timestamp=${timestamp}&signature=${hash}`;
  const key = await getListenKey(fullurl);
  start(wssurl, key);
}

async function binanceTestnetDataStream() {
  const apibase = 'https://testnet.binance.vision';
  const hash = createHash('sha256').update(secKey).digest('hex');
  const endpoint = '/api/v3/userDataStream';
  const timestamp = new Date().getTime();
  const fullurl = `${apibase}${endpoint}?timestamp=${timestamp}&signature=${hash}`;
  const key = await getListenKey(fullurl);
  start(wssurl, key);
}

binanceSpotDataStream();
binanceTestnetDataStream();
binanceFuturesDataStream();


let arr = [1, 10];
let newArray = arr.slice(1, -1);
console.log(newArray); // Output: [2, 3, 4, 5, 6, 7, 8, 9]

/