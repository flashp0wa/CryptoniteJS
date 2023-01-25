import {config} from './config.js';

const table = document.getElementById('table');
const row = document.createElement('tr');
const data = document.createElement('td');
const node = document.createTextNode('This is from script');
data.appendChild(node);
row.appendChild(data);
table.appendChild(row);

async function listLogs() {
  const url = `${config.BACKEND_URL}/application/logs/listLogs`;
  try {
    const logList = await (await fetch(url)).json();
    const logDropDown = document.getElementById('log-dropdown');
    logList.forEach((log) => {
      const option = document.createElement('option');
      option.innerHTML = log;
      logDropDown.appendChild(option);
    });
  } catch (error) {
    console.log(`Could not fetch logfiles: ${error}`);
  }
}

listLogs();
