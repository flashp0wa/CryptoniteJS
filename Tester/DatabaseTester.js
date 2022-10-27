/* eslint-disable */

require('dotenv').config({path: '.env'});
const { result } = require('lodash');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {
  
  const results = await sqlConnector.sproc_GatherSymbolTAData({
    symbol: 'ADAUSDT',
    timeFrame: '1h',
    dataPeriod: 10,
    macdDataPeriod: 5010,
    aroonDataPeriod: 14,
  });
  console.log(results);

})();