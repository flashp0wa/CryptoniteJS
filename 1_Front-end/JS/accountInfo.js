import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';

loadSymbols();

async function getAccountInfo() {
  async function getBalance() {
    const exchange = document.getElementById('exchange').value;
    const url = `${config.BACKEND_URL}/exchange/${exchange}/getAccountBalance`;
    const response = await (await fetch(url)).json();

    const balance = document.getElementById('account-balance');
    balance.className = 'py-2';
    const container = document.createElement('div');
    container.className = 'rounded-lg border border-white/20 py-4';
    const table = document.createElement('div');
    table.className = 'table w-full';
    const thead = document.createElement('div');
    thead.className = 'table-header-group';
    const trow = document.createElement('div');
    trow.className = 'table-row-group';
    balance.innerHTML = '';

    // Create table header
    const tr = document.createElement('div');
    tr.className = 'table-row font-bold';
    const tcellCoin = document.createElement('div');
    const tcellFree = document.createElement('div');
    const tcellUsed = document.createElement('div');
    tcellCoin.className = 'table-cell p-2';
    tcellFree.className = 'table-cell p-2';
    tcellUsed.className = 'table-cell p-2';
    tcellCoin.appendChild(document.createTextNode('Coin'));
    tcellFree.appendChild(document.createTextNode('Free'));
    tcellUsed.appendChild(document.createTextNode('Used'));
    tr.appendChild(tcellCoin);
    tr.appendChild(tcellFree);
    tr.appendChild(tcellUsed);
    thead.appendChild(tr);

    for (const [coin, free] of Object.entries(response.free)) {
      const tr = document.createElement('div');
      tr.className = 'table-row bg-neutral-800/90 hover:bg-neutral-800';
      const tcellCoin = document.createElement('div');
      const tcellFree = document.createElement('div');
      const tcellUsed = document.createElement('div');
      tcellCoin.className = 'table-cell p-2 border-t border-gray-200';
      tcellFree.className = 'table-cell p-2 border-t border-gray-200';
      tcellUsed.className = 'table-cell p-2 border-t border-gray-200';
      tcellCoin.appendChild(document.createTextNode(coin));
      tcellFree.appendChild(document.createTextNode(free));
      tcellUsed.appendChild(document.createTextNode(response.used[coin]));
      tr.appendChild(tcellCoin);
      tr.appendChild(tcellFree);
      tr.appendChild(tcellUsed);
      trow.appendChild(tr);
    }
    table.appendChild(thead);
    table.appendChild(trow);
    container.appendChild(table);
    balance.appendChild(container);
  }

  async function getOrders() {
    const exchange = document.getElementById('exchange').value;
    const url = `${config.BACKEND_URL}/exchange/getOrders`;
    const response = await (await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exchange,
      }),
    })).json();

    if (response.length === 0) return;

    const openOrders = document.getElementById('open-orders');
    const container = document.createElement('div');
    container.className = 'rounded-lg border border-white/20 py-4';
    const table = document.createElement('div');
    table.className = 'table w-full';
    const thead = document.createElement('div');
    thead.className = 'table-header-group';
    const trow = document.createElement('div');
    trow.className = 'table-row-group';
    openOrders.innerHTML = '';

    // Create table header
    const tr = document.createElement('div');
    tr.className = 'table-row font-bold';
    for (const key of Object.keys(response[0])) {
      const tcell = document.createElement('div');
      tcell.className = 'table-cell p-2';
      const data = document.createTextNode(key);
      tcell.appendChild(data);
      tr.appendChild(tcell);
      thead.appendChild(tr);
    }

    for (const order of response) {
      const tr = document.createElement('div');
      tr.className = 'table-row bg-neutral-800/90 hover:bg-neutral-800';
      for (const value of Object.values(order)) {
        const tcell = document.createElement('div');
        tcell.className = 'table-cell p-2 border-t border-gray-200';
        if (value === 'buy') tcell.className += ' text-green-500';
        if (value === 'sell') tcell.className += ' text-red-500';
        tcell.appendChild(document.createTextNode(value));
        tr.appendChild(tcell);
      }
      trow.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(trow);
    container.appendChild(table);
    openOrders.appendChild(container);
  }

  getBalance();
  getOrders();
}

async function cancelAllOrders() {
  const exchange = document.getElementById('exchange').value;
  const url = `${config.BACKEND_URL}/exchange/${exchange}/cancelOrders/all`;
  await fetch(url);
}

async function cancelOrder() {
  const exchange = document.getElementById('exchange').value;
  const symbol = document.getElementById('symbol').value;
  const url = `${config.BACKEND_URL}/exchange/${exchange}/cancelOrders/${symbol}`;
  await fetch(url);
}

function hideSidebar() {
  document.getElementById('sidebarContent').classList.toggle('hidden');
}

function hideMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}

getAccountInfo();

document.getElementById('sidebarBtn').addEventListener('click', hideSidebar);
document.getElementById('mobileMenuBtn').addEventListener('click', hideMenu);
document.getElementById('btnGetInfo').addEventListener('click', getAccountInfo);
document.getElementById('btnCancelOrder').addEventListener('click', cancelOrder);
document.getElementById('btnCancelAllOrders').addEventListener('click', cancelAllOrders);
