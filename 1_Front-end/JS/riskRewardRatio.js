import {loadSymbols} from './loadSymbols.js';
import {config} from './config.js';


loadSymbols();


function calcRiskReward() {
  const buyPrice = parseFloat(document.getElementById('buy-price').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);
  const buyCash = parseFloat(document.getElementById('buy-cash').value);
  const riskPercent = parseFloat(document.getElementById('risk-percent').value);

  if (buyCash && buyPrice && riskPercent) {
    const orderAmount = buyCash / buyPrice;
    const risk = buyCash * (riskPercent / 100);
    const stopPrice = (buyCash - risk) / orderAmount;
    const totalWProfit = orderAmount * sellPrice;
    const totalWoProfit = orderAmount * stopPrice;
    const profit = totalWProfit - buyCash;
    const profitPerorderAmount = (totalWProfit - buyCash) / orderAmount;
    const lossPerorderAmount = (totalWoProfit - buyCash) / orderAmount;
    const riskPerorderAmount = profitPerorderAmount - Math.abs(lossPerorderAmount);
    const ratio = (buyPrice - stopPrice) / (sellPrice - buyPrice);

    document.getElementById('sell-price').value = sellPrice.toFixed(4);
    document.getElementById('ratio').value = ratio.toFixed(4);
    document.getElementById('order-amount').value = orderAmount.toFixed(4);
    document.getElementById('profit-per-order-amount').value = profitPerorderAmount.toFixed(4);
    document.getElementById('loss-per-order-amount').value = lossPerorderAmount.toFixed(4);
    document.getElementById('profit').value = profit.toFixed(4);
    document.getElementById('risk').value = risk.toFixed(4);
    document.getElementById('total-w-profit').value = totalWProfit.toFixed(4);
    document.getElementById('total-wo-profit').value = totalWoProfit.toFixed(4);
    document.getElementById('stop-price').value = stopPrice.toFixed(4);
    document.getElementById('risk-per-order-amount').value = riskPerorderAmount.toFixed(4);
  }
}

async function createTrade() {
  const url = `${config.BACKEND_URL}/trade/createOrder`;
  const symbol = document.getElementById('symbol').value;
  const orderType = document.getElementById('order-type').value;
  const side = document.getElementById('side').value;
  const exchange = document.getElementById('exchange').value;
  const orderAmount = parseFloat(document.getElementById('order-amount').value);
  const buyPrice = Number(parseFloat(document.getElementById('buy-price').value).toFixed(4));
  const sellPrice = Number(parseFloat(document.getElementById('sell-price').value).toFixed(4));
  const stopPrice = Number(parseFloat(document.getElementById('stop-price').value).toFixed(4));

  function buildBodyObj(symbol, sellPrice, buyPrice, side, orderAmount, exchange, orderType, stopPrice) {
    return {
      symbol,
      sellPrice,
      buyPrice,
      side,
      orderAmount,
      exchange,
      orderType,
      stopPrice,
    };
  }

  await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildBodyObj(symbol, sellPrice, buyPrice, side, orderAmount, exchange, orderType, stopPrice)),
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
