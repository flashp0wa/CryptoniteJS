const {start} = require('../Cryptonite');
const {Exchanges} = require('../Classes/Exchanges/ExchangesClass');
// Spot test order test

(async () => {
  await start();
  const exchanges = new Exchanges();
  const exchange = exchanges.getExchanges().binanceSpotTest;
  exchange.webSocketClient.startUserDataStream();

  const order = {
    symbol: 'BTCUSDT',
    timeFrame: '1d',
    type: 'market',
    side: 'buy',
    orderAmount: 0.01,
    price: 0,
    limitPrice: 0,
    stopPrice: 0,
    strategy: 'test',
  };

  const rest = exchange.createOrder(order);

  console.log(rest);
})();

