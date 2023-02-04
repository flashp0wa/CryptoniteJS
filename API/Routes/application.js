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

router.route('/logs/loadLog').post((req, res) => {
  let data = fs.readFileSync(`${process.env.CRYPTONITE_ROOT}/Log/${req.body.logName}`);
  data = data.toString();
  const logEntries = [];
  let filter = false;
  if (req.body.startDate || req.body.endDate) filter = true;

  data.split(/\r?\n/).forEach((line) => {
    if (!line) {
      return;
    }
    const logObj = JSON.parse(line);
    for (const key of Object.keys(logObj)) {
      if (key === 'discord') delete logObj[key];
      if (key === 'obj') delete logObj[key];
    }
    if (filter) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const logDate = new Date(logObj.timestamp);
      if (logDate < startDate || logDate > endDate) return;
    }

    logEntries.push(logObj);
  });
  res.send(logEntries);
});


module.exports = router;
