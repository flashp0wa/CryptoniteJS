/*eslint-disable*/
require('dotenv').config({path:'../.env'});
const { ApplicationLog } = require('../Toolkit/Logger');
const {getDatabase} = require('../Classes/Database');
const {load} = require('../LoadEnvironment')

async function start() {
  await load();
  
  ApplicationLog.log({
    level: 'info',
    message: 'Teszt uzi',
    senderFunction: 'Teszt',
    file: 'GeneralTester',
    discord: 'gumiszoba',
  })
  
}

start();

