const childProcess = require('child_process');

let ps1;


function runPsCommand(command) {
  if (!ps1) {
    ps1 = childProcess.spawn('PowerShell.exe', [], {stdio: 'ignore'});
  }

  ps1.stdin.write(command);
}

module.exports = {
  runPsCommand,
};
