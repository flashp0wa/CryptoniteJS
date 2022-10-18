const fetch = require('node-fetch');

(async () => {
  let stuff = await fetch('https://data.binance.vision/?prefix=data/spot/daily/klines/DNTETH');
  console.log(stuff.status);
})();