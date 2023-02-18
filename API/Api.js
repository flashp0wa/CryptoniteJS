const express = require('express');
const exchange = require('./Routes/exchange');
const trade = require('./Routes/trade');
const dataScan = require('./Routes/dataScan');
const application = require('./Routes/application');
const {ApiLog} = require('../Toolkit/Logger');
const morgan = require('morgan');
// const path = require('path');

/**
 * Initializes cryptonite API
 */
function startApi() {
  const app = express();
  const port = process.env.CRYPTONITE_API_PORT;

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', `${process.env.FRONTEND_URL}`);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  // app.use(express.static(path.join(__dirname, '../1_Front-end')));
  app.use(morgan('combined'));
  app.use(express.json());
  app.use('/exchange', exchange);
  app.use('/trade', trade);
  app.use('/dataScan ', dataScan);
  app.use('/application', application);

  app.listen(port, () => {
    ApiLog.log({
      level: 'info',
      message: `API started on port: ${process.env.CRYPTONITE_API_PORT}`,
      senderFunction: 'startApi',
      file: 'Api.js',
    });
  });
}

module.exports = {
  startApi,
};
