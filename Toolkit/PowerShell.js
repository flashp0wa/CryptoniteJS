const Shell = require('node-powershell');
/**
 *
 * @param {string} psCommand
 * @return {object} // Command payload
 */
async function runPsCommand(psCommand) {
  const ps = new Shell({
    executionPolicy: 'Bypass',
    noProfile: true,
  });

  ps.addCommand(psCommand);
  return await ps.invoke();
}


module.exports = {
  runPsCommand,
};
