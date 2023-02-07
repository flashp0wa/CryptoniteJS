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
  const url = `${config.BACKEND_URL}/application/logs/loadLog`;
  const startDate = document.getElementById('filter-start-date').value;
  const endDate = document.getElementById('filter-end-date').value;

  const response = await (await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      logName,
    }),
  })).json();

  const logViewer = document.getElementById('logViewer');
  const container = document.createElement('div');
  container.className = 'bg-white bg-opacity-5 p-2 rounded-lg min-w-fit';
  const table = document.createElement('div');
  table.className = 'table w-full bg-zinc-800';
  const thead = document.createElement('div');
  thead.className = 'table-header-group';
  const trow = document.createElement('div');
  trow.className = 'table-row-group';
  logViewer.innerHTML = '';

  // Create table header
  const tr = document.createElement('div');
  tr.className = 'table-row sticky top-16 bg-violet-500 font-bold';
  for (const key of Object.keys(response[0])) {
    const tcell = document.createElement('div');
    tcell.className = 'table-cell p-2';
    const data = document.createTextNode(key[0].toUpperCase() + key.substring(1));
    tcell.appendChild(data);
    tr.appendChild(tcell);
    thead.appendChild(tr);
  }

  for (const log of response) {
    const tr = document.createElement('div');
    tr.className = 'table-row';
    switch (log.level) {
      case 'error':
        tr.className = 'table-row bg-rose-600 hover:bg-rose-700 text-black';
        break;
      case 'warn':
        tr.className = 'table-row bg-yellow-500 hover:bg-yellow-600 text-black';
        break;
      case 'info':
        tr.className = 'table-row hover:bg-stone-900';
        break;
    }
    for (const value of Object.values(log)) {
      const tcell = document.createElement('div');
      tcell.className = 'table-cell p-2';
      const data = document.createTextNode(value);
      tcell.appendChild(data);
      tr.appendChild(tcell);
      trow.appendChild(tr);
    }
  }
  table.appendChild(thead);
  table.appendChild(trow);
  container.appendChild(table);
  logViewer.appendChild(container);
}

function hideSidebar() {
  document.getElementById('sidebarContent').classList.toggle('hidden');
}

function hideMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

// async function loadLog() {
//   const logName = document.getElementById('logDropdown').value;
//   const url = `${config.BACKEND_URL}/application/logs/loadLog/${logName}`;
//   const response = await (await fetch(url)).json();
//   const logViewer = document.getElementById('logViewer');
//   const table = document.createElement('table');
//   table.className = 'mx-auto w-full table-auto bg-stone-800 border border-separate border-stone-600';
//   const thead = document.createElement('thead');
//   thead.className = 'sticky top-0 bg-stone-700';
//   const tbody = document.createElement('tbody');
//   tbody.id = 'tableBody';
//   const tr = document.createElement('tr');
//   tr.className = 'table-row';
//   tr.id = 'tableHeaderRow';
//   logViewer.innerHTML = '';

//   // Create table header
//   for (const key of Object.keys(response[0])) {
//     const th = document.createElement('th');
//     th.className = 'tableHeader';
//     const data = document.createTextNode(key[0].toUpperCase() + key.substring(1));
//     th.appendChild(data);
//     tr.appendChild(th);
//     thead.appendChild(tr);
//   }
//   for (const log of response) {
//     const tr = document.createElement('tr');
//     tr.className = 'tableRow';
//     switch (log.level) {
//       case 'error':
//         tr.className = 'bg-red-600 hover:bg-red-700';
//         break;
//       case 'warn':
//         tr.className = 'bg-yellow-600 hover:bg-yellow-700';
//         break;
//       case 'info':
//         tr.className = 'hover:bg-stone-900';
//         break;
//     }
//     for (const value of Object.values(log)) {
//       const td = document.createElement('td');
//       td.className = 'border border-stone-600'
//       const data = document.createTextNode(value);
//       td.appendChild(data);
//       tr.appendChild(td);
//       tbody.appendChild(tr);
//     }
//   }
//   table.appendChild(thead);
//   table.appendChild(tbody);
//   logViewer.appendChild(table);
// }

document.getElementById('loadBtn').addEventListener('click', loadLog);
document.getElementById('sidebarBtn').addEventListener('click', hideSidebar);
document.getElementById('mobileMenuBtn').addEventListener('click', hideMenu);
