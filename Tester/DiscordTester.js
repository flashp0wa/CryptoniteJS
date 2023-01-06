/*eslint-disable*/
require('dotenv').config({path: '.env'});
const { ApplicationLog } = require('../Toolkit/Logger');

const a = {
  symbol: 'BTCUSDT',
  side: 'sell',
  quantity: 1000,
  price: 30000,
  stopPrice: 20000,
  stopLimitPrice: 19999,
  stopLimitTimeInForce: 'GTC',
};

const symbol = 'BTCUSDT',
orderAmount = 1000,
limitPrice = 70000,
stopPrice = 60000,
stopLimitPrice = 59999;

(async () => {
  // getServerChannel(process.env.DSCRD_CHNL_GUMISZOBA).send(`Test object: \`\`\`${discordify(a)}\`\`\``);
  // TraderLog.log({
  //   discord: 'gumiszoba',
  //   level: 'error',
  //   message: 'AAAAAA EERRRROR',
  // });

  ApplicationLog.log({
    level: 'info',
    message: 'Teszt uzi',
    senderFunction: 'Teszt',
    file: 'GeneralTester',
    discord: 'gumiszoba',
  })
})();

setTimeout(() => {
  process.exit();
}, 5000);

