/*eslint-disable*/

require('dotenv').config({path: '.env'});
const _ = require('lodash');
const ccxt = require('ccxt');
const { BinanceFuturesClass } = require('../Classes/Exchanges/Binance/BinanceFuturesClass');
const { CreateOrder } = require('../Classes/Exchanges/Binance/Order/CreateOrderClass');
const { BinanceSpotTestClass } = require('../Classes/Exchanges/Binance/BinanceSpotTestClass');
const { BinanceSpotClass } = require('../Classes/Exchanges/Binance/BinanceSpotClass');

const futures = new BinanceFuturesClass('binanceFutures');
const spot = new BinanceSpotClass('binanceSpot');
// const spotTest = new BinanceSpotTestClass('binanceSpotTest');

(async () => {
  try {

    let since = new Date('2023-01-14 22:54:59');
    since = since.setHours(since.getHours() + 1);
    const ohlcv = await spot.excObj.publicGetKlines({
      symbol: 'BTCUSDT',
      interval: '5m',
      startTime: since,
      endTime: new Date().getTime(),
    });
    console.log(ohlcv);


    // console.log(await futures.excObj.fetchBalance());j
    // console.log((await futures.excObj.fetchBalance()).free.USDT);
  // await futures.loadExchangeId();
  // // futures.loadOpenOrders();
  // await futures.loadMarkets();
  // const orderObj = {
  //   symbol: 'BTCUSDT',
  //   type: 'market',
  //   side: 'buy',
  //   price: 16700,
  //   stopPrice: 16000,
  //   limitPrice: 18000,
  //   orderAmount: 0.01,
  // }
  // const order = new CreateOrder(futures, orderObj).createOrder();

  // spotTest.openOrders.checkOrderStatus();

  // console.log(await binanceTst.fetchOrder(3267846654, 'BTCUSDT'));
    // await binanceTst.cancelOrder(3267846667, 'BTCUSDT');
  // console.log(binanceTst.id);
  // await binanceTst.loadMarkets();
  // console.log(binanceTst.markets);
  // console.log(await binanceTst.fetchBalance());

  // const resp = await binanceTst.createOrder('BTCUSDT', 'stop', 'sell', 0.01, 16300, {
  //   stopPrice: 16500,
  // })  

  // const resp0 = await binanceTst.createOrder('BTCUSDT', 'market', 'buy', 0.02, 16800);  
  // const resp1 = await binanceTst.createOrder('BTCUSDT', 'market', 'buy', 0.03, 16800);  
  // const resp2 = await binanceTst.createOrder('BTCUSDT', 'take_profit_market', 'sell', 0.02, 16300, {
  //   stopPrice: 17000,
    // closePosition: true,
  // })  

  // console.log(resp2);
} catch (error) {
  console.log(error);
}
  // console.log(await binanceTst.fetchTicker('BTC/USDT'));


})();

console.log()


