const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const {ApiLog} = require('../../Toolkit/Logger.js');
const {returnEmitter} = require('../../Loaders/EventEmitter.js');

const globalEvent = returnEmitter();

router.route('/createOrder').post((req, res) => {
  ApiLog.info('Creating order');
  globalEvent.emit('CreateOrder', req.body);
  res.send('Request sent');
});

module.exports = router;
