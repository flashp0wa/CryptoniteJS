const ccxt = require('ccxt');

const binance = new ccxt.binance();
(async () => {
  // binance.apiKey = 'YBf0pHXXg0Dt7pvQnaPMKNsVKgmInLR5cpAoJ7HbPLBQ7mWOBRNRmLJwKgFXg6yD';
  // binance.secret = 'N9JeRZbhMNijPHUgYZAOVl0uD0lnmB9zaiMqr3SlQfX0AavNDJGmzkzo7psUAuaT';
  // binance.setSandboxMode(true);
  // const lol = await binance.createOrder('XRPUSDT', 'MARKET', 'sell', 900, 1);
  // const lol2 = await binance.createMarketOrder('XRPUSDT', 'sell', 90, 0.7529);

  binance.apiKey = 'yK3DgIpHn87652aZPlObAaAnUHXAP269sOqidQzNelpnfTVuMIu1S4R4pMHXcvJv';
  binance.secret = 'hLsIocD0ghgCnmZ35JvD7w8gNsaz9EmjuATc16f2ZpL7XFA9SL5uHphcqiDUwZ2L';

  // const lol = await binance.createMarketOrder('MBLUSDT', 'buy', 2000, 0.0068);

  lol = await binance.fetchBalance();
  // console.log(binance);

  const {symbol} = await binance.fetchTicker('ADAUSDT');
  console.log(symbol);


  const stuff = await calcOrderVol('ADAUSDT', binance, 50);
  console.log(stuff);
})();
