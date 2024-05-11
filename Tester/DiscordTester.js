/*eslint-disable*/

async function start() {
  const {load} = require('../LoadEnvironment')
  await load();
  const { ApplicationLog } = require('../Toolkit/Logger')
  
  ApplicationLog.log({
    level: 'info',
    message: 'Teszt uzi',
    senderFunction: 'Teszt',
    file: 'GeneralTester',
    discord: 'gumiszoba',
  })
  
}

start();

