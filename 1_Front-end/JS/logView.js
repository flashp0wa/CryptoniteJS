import {config} from './config.js';

async function listLogs() {
  const url = `${config.BACKEND_URL}/application/logs/listLogs`;
  try {
    const logList = await (await fetch(url)).json();
    const logDropDown = document.getElementById('logDropdown');
    logList.forEach((log) => {
      const option = document.createElement('option');
      option.value = log;
      option.innerHTML = log.split('-')[0];
      logDropDown.appendChild(option);
    });
  } catch (error) {
    console.log(`Could not fetch logfiles: ${error}`);
  }
}

listLogs();

async function loadLog() {
  const logName = document.getElementById('logDropdown').value;
  const url = `${config.BACKEND_URL}/application/logs/loadLog/${logName}`;
  const response = await (await fetch(url)).json();
  const logViewer = document.getElementById('logViewer');
  const table = document.createElement('table');
  table.className = 'table';
  const tr = document.createElement('tr');
  tr.className = 'tableRow';
  tr.id = 'tableHeaderRow';
  logViewer.innerHTML = '';

  // Create table header
  for (const key of Object.keys(response[0])) {
    const th = document.createElement('th');
    th.className = 'tableHeader';
    const data = document.createTextNode(key[0].toUpperCase() + key.substring(1));
    th.appendChild(data);
    tr.appendChild(th);
    table.appendChild(tr);
  }
  for (const log of response) {
    const tr = document.createElement('tr');
    tr.className = 'tableRow';
    switch (log.level) {
      case 'error':
        tr.id = 'tableRowError';
        break;
      case 'warn':
        tr.id = 'tableRowWarn';
        break;
      case 'info':
        tr.id = 'tableRowInfo';
        break;
    }
    for (const value of Object.values(log)) {
      const td = document.createElement('td');
      const data = document.createTextNode(value);
      td.appendChild(data);
      tr.appendChild(td);
      table.appendChild(tr);
    }
  }

  logViewer.appendChild(table);
}

document.getElementById('loadBtn').addEventListener('click', loadLog);
