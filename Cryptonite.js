'use strict';
require('dotenv').config({path: '.env'});
(async () => {
  // const {loadDiscordApi} = require('./DiscordAPI/DiscordBot');
  // await loadDiscordApi();
  const {getDatabase} = require('./Classes/Database');
  const db = getDatabase();
  await db.connect();

  async function loadEnv() {
    const res = await db.singleRead('select * from cry_setting_application');

    for (const row of res) {
      process.env[row.settingKey] = row.settingValue;
    }
  }

  await loadEnv();
  const {ApplicationLog} = require('./Toolkit/Logger');
  const {loadEventListeners} = require('./Loaders/Events');
  const {getExchanges} = require('./Classes/Exchanges/ExchangesClass');
  const {startApi} = require('./API/Api');
  const {startIntervals} = require('./Intervals');

  await getExchanges().loadExchanges();
  loadEventListeners();
  startIntervals();
  startApi();
  ApplicationLog.log({
    level: 'info',
    message: `Application online, let the money shower! | Trade Mode: ${process.env.CRYPTONITE_TRADE_MODE}`,
    senderFunction: 'Crypt0nite',
    file: 'Cryptonite.js',
    discord: 'gumiszoba',
  });
})();
