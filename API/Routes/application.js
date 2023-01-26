const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const fs = require('fs');

router.route('/logs/listLogs').get((req, res) => {
  const files = fs.readdirSync(`${process.env.CRYPTONITE_ROOT}/Log`);
  const filteredArray = [];
  files.forEach((file) => {
    if (file.includes('.log')) filteredArray.push(file);
  });
  res.send(filteredArray);
});

router.route('/logs/loadLog/:logName').get((req, res) => {
  let data = fs.readFileSync(`${process.env.CRYPTONITE_ROOT}/Log/${req.params.logName}`);
  data = data.toString();
  const logEntries = [];

  data.split(/\r?\n/).forEach((line) => {
    if (!line) {
      return;
    }
    const logObj = JSON.parse(line);
    for (const key of Object.keys(logObj)) {
      if (key === 'discord') delete logObj[key];
    }
    logEntries.push(logObj);
  });
  res.send(logEntries);
});


module.exports = router;
