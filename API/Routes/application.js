const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const fs = require('fs');
const {getDatabase} = require('../../Classes/Database.js');
const {ApiLog} = require('../../Toolkit/Logger.js');
const db = getDatabase();


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

router.route('/settings/load').get(async (req, res) => {
  try {
    const settings = await db.singleRead('select * from cry_setting_application');
    const returnObj = {};
    for (const setting of settings) {
      returnObj[setting.settingKey] = setting.settingValue;
    }
    res.send(returnObj);
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Error loading settings: ${error}`,
      senderFunction: 'route-settings-save',
      file: 'application.js',
    });
  }
});
router.route('/settings/save').post(async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.singleRead(`update cry_setting_application set settingValue = '${value}' where settingKey = '${key}'`);
    }
    res.send('saved');
  } catch (error) {
    ApiLog.log({
      level: 'error',
      message: `Error saving settings: ${error}`,
      senderFunction: 'route-settings-save',
      file: 'application.js',
    });
  }
});


module.exports = router;
