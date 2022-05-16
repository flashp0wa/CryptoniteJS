import {loadSymbols} from './loadSymbols.js'

loadSymbols();


function calcRiskReward() {
  const buyPrice = parseFloat(document.getElementById('buy-price').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);
  const buyCash = parseFloat(document.getElementById('buy-cash').value);
  const riskPercent = parseFloat(document.getElementById('risk-percent').value);

  if (buyCash && buyPrice &&  riskPercent) {
    const share = buyCash / buyPrice;
    const risk = buyCash * (riskPercent / 100);
    const stopLossPrice = (buyCash - risk) / share;
    const totalWProfit = share * sellPrice;
    const totalWoProfit = share * stopLossPrice;
    const profit = totalWProfit - buyCash;
    const profitPerShare = (totalWProfit - buyCash) / share;
    const lossPerShare = (totalWoProfit - buyCash) / share;
    const riskPerShare = profitPerShare - Math.abs(lossPerShare);
    const ratio = (buyPrice - stopLossPrice) / (sellPrice - buyPrice);

    document.getElementById('sell-price').value = sellPrice.toFixed(2);
    document.getElementById('ratio').value = ratio.toFixed(2);
    document.getElementById('share').value = share.toFixed(2);
    document.getElementById('profit-per-share').value = profitPerShare.toFixed(2);
    document.getElementById('loss-per-share').value = lossPerShare.toFixed(2);
    document.getElementById('profit').value = profit.toFixed(2);
    document.getElementById('risk').value = risk.toFixed(2);
    document.getElementById('total-w-profit').value = totalWProfit.toFixed(2);
    document.getElementById('total-wo-profit').value = totalWoProfit.toFixed(2);
    document.getElementById('stop-loss-price').value = stopLossPrice.toFixed(2);
    document.getElementById('risk-per-share').value = riskPerShare.toFixed(2);
  }
}

async function createTrade() {
  const url = 'http://127.0.0.1:3000/trade/createOrder';
  const symbol = document.getElementById('symbol').value;
  const orderType = document.getElementById('order-type').value;
  const side = document.getElementById('side').value;
  const exchange = document.getElementById('exchange').value;
  const share = document.getElementById('share').value;
  const bodyObj = {};
  const buyPrice = parseFloat(document.getElementById('buy-price').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);
  const stopLossPrice = parseFloat(document.getElementById('stop-loss-price').value);

  bodyObj.symbol = symbol;
  bodyObj.sellPrice = sellPrice;
  bodyObj.buyPrice = buyPrice;
  side === 'sell' ? bodyObj.price = sellPrice : bodyObj.price = buyPrice;
  bodyObj.side = side;
  bodyObj.orderAmount = parseFloat(share);
  bodyObj.exchange = exchange;
  bodyObj.orderType = orderType;
  bodyObj.stopLossPrice = stopLossPrice;

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
