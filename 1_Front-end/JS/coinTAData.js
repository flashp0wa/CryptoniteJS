import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';
import {loadTimeframes} from './loadTimeframes.js';

loadSymbols();
loadTimeframes();

async function getCointTAData() {
  const url = `${config.BACKEND_URL}/exchange/binance/coinTAData`;
  const resultText = document.getElementById('resultText');
  const calendar = document.getElementById('calendar').value.split('T');
  const result = await (
    await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: document.getElementById('symbol').value,
        dataPeriod: document.getElementById('dataPeriod').value,
        macdDataPeriod: document.getElementById('macdDataperiod').value,
        timeFrame: document.getElementById('timeFrame').value,
        aroonDataPeriod: document.getElementById('aroonDataPeriod').value,
        eventTime: calendar[0] + ' ' + calendar[1] + '%',
      }),
    })
  ).json();
  resultText.value = '';

  for (const [taName, taValue] of Object.entries(result)) {
    resultText.value += `${taName} : ${taValue}\n`;
  }
}

document.getElementById('btnGet').addEventListener('click', getCointTAData);

