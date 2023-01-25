/* eslint-disable */
require('dotenv').config({path: '.env'});
const fs = require('fs');



(async () => {

let data = fs.readFileSync('./Log/Application-2023-01-20.log');
data = data.toString();

data.split(/\r?\n/).forEach(line =>  {
  if (!line) {
    return;
  }
  console.log(`Line from file: ${JSON.parse(line).message}`);
});

})();

const data = fs.readdirSync('./Log');
console.log(data);