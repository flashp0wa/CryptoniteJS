/* eslint-disable */
require('dotenv').config({path: '.env'});
const fs = require('fs');
const decompress = require('decompress');

const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
const alreadyDownloaded = [];

// (async () => {
//   const zip = fs.readdirSync(downloadPath);
  
//   for (const file of zip) {
//     await decompress(`${downloadPath}\\${file}`, '../Inboxes/BinanceData'); 
//   }
// })

(async () => {
  const zip = fs.readdirSync(downloadPath);
  
  for (const file of zip) {
    await decompress('BTCUSDT-5m-2023-01-10.zip', './Tester'); 
  }
})

