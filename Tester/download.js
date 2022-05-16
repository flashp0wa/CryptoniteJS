require('dotenv').config({path: '.env'});
const download = require('download');

// Url of the image
const file = 'https://data.binance.vision/data/spot/daily/klines/1INCHBTC/12h/1INCHBTC-12h-2022-04-13.zip';
// Path at which image will get downloaded
const filePath = `${process.env.CRYPTONITE_ROOT}/Inboxes/BinanceData`;

download(file, filePath)
    .then(() => {
      console.log('Download Completed');
    });
