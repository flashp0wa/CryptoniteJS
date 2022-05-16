 /* eslint-disable */
const {returnEmitter} = require('../Loaders/EventEmitter.js');
const express = require('express');

function startApi(params) {
  const app = express()
  const port = process.env.CRYPTONITE_API_PORT;
  
  const globalEvent = returnEmitter();
  
  app.post('/trade/createOrder/:symbol.:price.:side.:exchange.:orderAmount.:orderType', (req, res) => {
    globalEvent.emit('CreateOrder', req.params)
    res.send(`This is ${req.name}`)
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
}