const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const fs = require('fs');

router.route('/logs/listLogs').get((req, res) => {
  const files = fs.readdirSync('../../Log/');
  const filteredArray = [];
  files.forEach((file) => {
    if (file.includes('.log')) filteredArray.push(file);
  });
  res(filteredArray);
});

module.exports = router;
