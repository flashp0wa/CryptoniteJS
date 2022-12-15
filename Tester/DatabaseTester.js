/* eslint-disable */

require('dotenv').config({path: '.env'});
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');


(async () => {
  
// const result = await sqlConnector.selectEverythingFrom('cry_candle_types');
// console.log(result);

const val1 = 1
const val2 = 3

switch (val1) {
  case 1:

    switch (val2) {
      case 2 :
      case 3 :
        console.log('David');
        break;
    
      default:
        break;
    }
    
    break;

  default:
    break;
}

})();