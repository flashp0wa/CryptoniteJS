/* eslint-disable */

require('dotenv').config({path: '.env'});
const { result } = require('lodash');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {
  
  const results = await sqlConnector.updateTable('cry_order_sell','orderStatus=\'cancelled\'', 'orderId=2701443' );
  console.log(results);

})();