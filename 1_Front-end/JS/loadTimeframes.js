
export function loadTimeframes() {
  const timeframe = document.getElementById('timeFrame');
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
  ];

  klinesArr.forEach((element) => {
    const newOption = document.createElement('option');
    newOption.innerHTML = element;
    timeframe.appendChild(newOption);
  });
}
