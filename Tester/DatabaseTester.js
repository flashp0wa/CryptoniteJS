/* eslint-disable */

require('dotenv').config({path: '.env'});
const { result } = require('lodash');
const sqlConnector = require('../DatabaseConnection/SQLConnector.js');

(async () => {
  const query = `with RowNum as (
    select Symbol, Cost,
      row_number() over (partition by Symbol order by EventTime desc) as RowNumb
    from Orders
    where Status = 'closed' and Side = 'sell'
  )
  
  select Symbol, Cost from RowNum
  where RowNumb ='1'`;
  const results = await sqlConnector.singleRead(query);
  
  console.log(results.recordset);

//   const myMap = new Map();
//   const lol = results.recordset
  
//   for (const stuff of results.recordset) {
//     myMap.set(stuff.Symbol, stuff.Sold)
//   }
// myMap.delete('ADA');
// console.log(myMap);
})();