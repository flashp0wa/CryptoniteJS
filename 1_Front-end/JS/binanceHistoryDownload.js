import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';

loadSymbols();

const radioDate = document.getElementById('radio-date');
const radioRange = document.getElementById('radio-range');
const endDate = document.getElementById('end-date');
const klines = document.getElementById('dropdown-klines');
const labelKlines = document.getElementById('label-klines');
const divlKlines = document.getElementById('div-klines');
const radioMonthly = document.getElementById('radio-monthly');
const radioDaily = document.getElementById('radio-daily');

radioDate.checked = true;
endDate.disabled = true;
radioDaily.checked = true;

klines.hidden = true;
labelKlines.hidden = true;
divlKlines.hidden = true;

function toggleDaily() {
  radioMonthly.checked = false;
}
function toggleMonthly() {
  radioDaily.checked = false;
}

function toggleSpecificDate() {
  endDate.disabled = true;
  radioRange.checked = false;
}
function toggleRange() {
  endDate.disabled = false;
  radioDate.checked = false;
}
function toggleTradeType() {
  switch (document.getElementById('trade-type').value) {
    case 'aggTrades':
      klines.hidden = true;
      labelKlines.hidden = true;
      divlKlines.hidden = true;
      break;
    case 'trades':
      klines.hidden = true;
      labelKlines.hidden = true;
      divlKlines.hidden = true;
      break;
    case 'klines':
      klines.hidden = false;
      labelKlines.hidden = false;
      divlKlines.hidden = false;
      const klinesArr = [
        '1m',
        '3m',
        '5m',
        '15m',
        '30m',
        '1h',
        '2h',
        '4h',
        '6h',
        '8h',
        '12h',
        '1d',
        '3d',
        '1w',
        '1mo',
        '1s',
      ];
      klinesArr.forEach((kline) => {
        const newOption = document.createElement('option');
        newOption.value = kline;
        newOption.id = `kline-${kline}`; // kline-1m
        newOption.innerHTML = kline;
        klines.appendChild(newOption);
      });
      const newOption = document.createElement('option');
      newOption.value = 'all';
      newOption.id = 'kline-all';
      newOption.innerHTML = 'All';
      klines.appendChild(newOption);

      break;

    default:
      break;
  }
}
async function download() {
  const url = `${config.BACKEND_URL}/exchange/binance/historyDataDownload`;
  const bodyObj = {};
  bodyObj.symbol = document.getElementById('symbol').value;
  bodyObj.tradeType = document.getElementById('trade-type').value;
  bodyObj.klinesTimeFrame = document.getElementById('dropdown-klines').value;
  bodyObj.startDate = document.getElementById('start-date').value;
  if (radioDaily.checked === true) {
    bodyObj.timeFrame = document.getElementById('radio-daily').value;
  } else {
    bodyObj.timeFrame = document.getElementById('radio-monthly').value;
  }

  if (radioRange.checked) {
    bodyObj.endDate = document.getElementById('end-date').value;
  }

  await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyObj),
  });
}

document.getElementById('download').addEventListener('click', download);
document.getElementById('trade-type').addEventListener('change', toggleTradeType);
radioRange.addEventListener('change', toggleRange);
radioDate.addEventListener('change', toggleSpecificDate);
radioDaily.addEventListener('change', toggleDaily);
radioMonthly.addEventListener('change', toggleMonthly);

