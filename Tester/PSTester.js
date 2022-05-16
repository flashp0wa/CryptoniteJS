/* eslint-disable */

const {runPsCommand} = require('../Toolkit/PowerShell.js');

(async () => {
  const lol = await runPsCommand('Cryptonite.Cmc.QuotesLatest -CryptoniteJS');
  console.log(lol);
})();

