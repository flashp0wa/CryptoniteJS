/* eslint-disable */
require('dotenv').config({path: '.env'});
const fs = require('fs');

const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
const alreadyDownloaded = [];

fs.readdirSync(downloadPath).forEach(file => {
  alreadyDownloaded.push(file);
});

console.log(alreadyDownloaded);

switch (key) {
  case value:
    
    break;

  default:
    break;
}