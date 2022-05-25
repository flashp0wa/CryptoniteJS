/* eslint-disable */

require('dotenv').config({path: '.env'});
const { result } = require('lodash');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {
  const obj = {
    name : 'Bazsi',
  }
  
  const data = {
    dataObj : obj,
    statement: 'INSERT INTO',
    table: 'dummy',
  }
  
  
  const results = await sqlConnector.writeToDatabase(data, {insertIntoAll: false});
  

  console.log(results.recordset);

})();