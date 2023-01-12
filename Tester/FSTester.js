/* eslint-disable */
require('dotenv').config({path: '.env'});
const fs = require('fs');
const extract = require('extract-zip')


async function main () {
}

const downloadPath = `${process.env.CRYPTONITE_ROOT}\\Inboxes\\BinanceData`;
const alreadyDownloaded = [];
const zipFiles = fs.readdirSync(downloadPath);

(async () => {
  console.log(zipFiles);
  
  for (const file of zipFiles) {
    const filePath = `${downloadPath}\\${file}`;
    try {
      await extract(`${downloadPath}\\${file}`, { dir: downloadPath })
      console.log('Extraction complete');
      fs.unlinkSync(filePath)
    } catch (err) {
      // handle any errors
    }

  }
})();



