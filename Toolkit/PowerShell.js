const Shell = require('node-powershell');
/**
 *
 * @param {string} psCommand
 * @return {object} // Command payload
 */

let ps;

async function runPsCommand(psCommand) {
  if (!ps) {
    ps = new Shell({
      executionPolicy: 'Bypass',
      noProfile: true,
    });
  }

  ps.addCommand(psCommand);
  await ps.invoke();
  // ps = null;
  return;
}


module.exports = {
  runPsCommand,
};
