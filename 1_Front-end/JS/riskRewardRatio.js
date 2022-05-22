import {loadSymbols} from './loadSymbols.js'
import {config} from './config.js'


loadSymbols();


function calcRiskReward() {
  const buyPrice = parseFloat(document.getElementById('buy-price').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);
  const buyCash = parseFloat(document.getElementById('buy-cash').value);
  const riskPercent = parseFloat(document.getElementById('risk-percent').value);

  if (buyCash && buyPrice &&  riskPercent) {
    const share = buyCash / buyPrice;
    const risk = buyCash * (riskPercent / 100);
    const stopLimitPrice = (buyCash - risk) / share;
    const totalWProfit = share * sellPrice;
    const totalWoProfit = share * stopLimitPrice;
    const profit = totalWProfit - buyCash;
    const profitPerShare = (totalWProfit - buyCash) / share;
    const lossPerShare = (totalWoProfit - buyCash) / share;
    const riskPerShare = profitPerShare - Math.abs(lossPerShare);
    const ratio = (buyPrice - stopLimitPrice) / (sellPrice - buyPrice);

    document.getElementById('sell-price').value = sellPrice.toFixed(4);
    document.getElementById('ratio').value = ratio.toFixed(4);
    document.getElementById('share').value = share.toFixed(4);
    document.getElementById('profit-per-share').value = profitPerShare.toFixed(4);
    document.getElementById('loss-per-share').value = lossPerShare.toFixed(4);
    document.getElementById('profit').value = profit.toFixed(4);
    document.getElementById('risk').value = risk.toFixed(4);
    document.getElementById('total-w-profit').value = totalWProfit.toFixed(4);
    document.getElementById('total-wo-profit').value = totalWoProfit.toFixed(4);
    document.getElementById('stop-limit-price').value = stopLimitPrice.toFixed(4);
    document.getElementById('risk-per-share').value = riskPerShare.toFixed(4);
  }
}

async function createTrade() {
  const url = `${config.BACKEND_URL}/trade/createOrder`;
  const symbol = document.getElementById('symbol').value;
  const orderType = document.getElementById('order-type').value;
  const side = document.getElementById('side').value;
  const exchange = document.getElementById('exchange').value;
  const share = document.getElementById('share').value;
  const bodyObj = {};
  const buyPrice = parseFloat(document.getElementById('buy-price').value).toFixed(4);
  const sellPrice = parseFloat(document.getElementById('sell-price').value).toFixed(4);
  const stopLimitPrice = parseFloat(document.getElementById('stop-limit-price').value).toFixed(4);

  bodyObj.symbol = symbol;
  bodyObj.sellPrice = Number(sellPrice)
  bodyObj.buyPrice = Number(buyPrice);
  bodyObj.side = side;
  bodyObj.orderAmount = parseFloat(share);
  bodyObj.exchange = exchange;
  bodyObj.orderType = orderType;
  bodyObj.stopLimitPrice = Number(stopLimitPrice);

  console.log(bodyObj);

  await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyObj),
  });
}
function resetValues() {
  const elements = document.querySelectorAll('.userInput  input');
  for (let i = 0; i < elements.length; i++) {
    elements[i].value = '';
  }
}


document.getElementById('tradeBtn').addEventListener('click', createTrade);
document.getElementById('resetBtn').addEventListener('click', resetValues);

document.getElementById('buy-cash').addEventListener('change', calcRiskReward);
document.getElementById('buy-price').addEventListener('change', calcRiskReward);
document.getElementById('sell-price').addEventListener('change', calcRiskReward);
document.getElementById('risk-percent').addEventListener('change', calcRiskReward);
