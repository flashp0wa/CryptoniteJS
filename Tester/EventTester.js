require('dotenv').config({path: '.env'});
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const {loadEventListeners} = require('../Loaders/Events.js');
const {Order} = require('../Classes/OrderClass.js');
const dataBank = require('../Loaders/LoadDataBank.js');

(async () => {
  await dataBank.loadDataBank();
  loadEventListeners();
  const globalEvent = returnEmitter();

  // globalEvent.emit('CreateOrder', {
  //   symbol: 'MBLUSDT',
  //   price: 0.005596,
  //   side: 'sell',
  //   exchange: 'binance',
  //   orderAmountPercent: 99,
  //   orderType: 'createMarketOrder',
  // });

  globalEvent.emit('CreateOrder', new Order('MBLUSDT', 0.006074, 'sell', 'binance', 90, 'createMarketOrder'));

  setInterval(() => {
    // globalEvent.emit('CreateOrder', {
    //   symbol: 'MBLUSDT',
    //   price: 0.005596,
    //   side: 'buy',
    //   exchange: 'binance',
    //   orderAmountPercent: 80,
    //   useLastOrderCost: true,
    //   orderType: 'createMarketOrder',
    // });
    globalEvent.emit('CreateOrder', new Order('MBLUSDT', 0.006054, 'buy', 'binance', 80, 'createMarketOrder', true));
  }, 10000);
})();
