import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';

loadSymbols();

const radioMonthly = document.getElementById('radio-monthly');
const radioDaily = document.getElementById('radio-daily');
const radioDate = document.getElementById('radio-date');
const radioRange = document.getElementById('radio-range');
const endDate = document.getElementById('end-date');
const klines = document.getElementById('dd-klines');
const lklines = document.getElementById('lklines');

klines.hidden = true;
lklines.hidden = true;

function toggleTimeFrameDaily() {
  radioMonthly.checked = false;
}
function toggleTimeFrameMonthly() {
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
      lklines.hidden = true;
      break;
    case 'trades':
      klines.hidden = true;
      lklines.hidden = true;
      break;
    case 'klines':
      klines.hidden = false;
      lklines.hidden = false;
      const klinesArr = [
        '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1mo',
      ];

      klinesArr.forEach((kline) => {
        const newOption = document.createElement('option');
        newOption.value = kline;
        newOption.id = `kline-${kline}`; // kline-1m
        newOption.innerHTML = kline;
        klines.appendChild(newOption);
      });
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
  if (document.getElementById('radio-daily').checked) {
    bodyObj.timeFrame = 'daily';
  } else {
    bodyObj.timeFrame = 'monthly';
  }
  bodyObj.klinesTimeFrame = document.getElementById('dd-klines').value;
  bodyObj.startDate = document.getElementById('start-date').value;
  bodyObj.endDate = document.getElementById('end-date').value;

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
radioDaily.addEventListener('change', toggleTimeFrameDaily);
radioMonthly.addEventListener('change', toggleTimeFrameMonthly);


