import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';

loadSymbols();

async function getAccountInfo() {
  const exchange = document.getElementById('exchange').value;
  const url = `${config.BACKEND_URL}/exchange/${exchange}/getAccountInfo`;
  const response = await (await fetch(url)).json();
  const balance = document.getElementById('account-balance');
  const openOrdersText = document.getElementById('open-orders');

  balance.value = '';
  openOrdersText.value = '';

  balance.value = 'Free:\n';
  for (const coin in response.free) {
    if (response.free.hasOwnProperty.call(response.free, coin)) {
      const line = `${coin} : ${response.free[coin]}\n`;
      balance.value += line;
    }
  }

  balance.value += '\n';

  balance.value += 'Used:\n';
  for (const coin in response.used) {
    if (Object.hasOwnProperty.call(response.used, coin)) {
      const line = `${coin} : ${response.used[coin]}\n`;
      balance.value += line;
    }
  }

  for (const order in response.openOrders) {
    if (Object.hasOwnProperty.call(response.openOrders, order)) {
      const symbol = response.openOrders[order].info.symbol;
      const type = response.openOrders[order].type;
      const side = response.openOrders[order].side;
      const price = response.openOrders[order].price;
      const amount = response.openOrders[order].amount;
      const filled = response.openOrders[order].filled;
      const date = response.openOrders[order].datetime;
      const timeInForce = response.openOrders[order].timeInForce;
      const line = `Symbol: ${symbol} | Type: ${type} | Side: ${side} | Price: ${price} | Amount: ${amount} | Filled: ${filled} | Date: ${date} | Time: ${timeInForce}\n`;
      openOrdersText.value += line;
    }
  }
}

async function cancelAllOrders(params) {
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


document.getElementById('btnGetInfo').addEventListener('click', getAccountInfo);
document.getElementById('btnCancelOrder').addEventListener('click', cancelOrder);
document.getElementById('btnCancelAllOrders').addEventListener('click', cancelAllOrders);
