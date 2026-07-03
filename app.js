var chartInstance = null;
var lastResults = null;
var workbenchReady = false;

var rootStyles = getComputedStyle(document.documentElement);

function validateRedirectUrl(url) {
  if (!/^https?:\/\//.test(url)) {
    console.error('URL de redirecionamento invalida: ' + url);
    return false;
  }
  return true;
}

function hexToRgba(hex, alpha) {
  if (hex.charAt(0) === '#') hex = hex.slice(1);
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function toDecimalStr(val) {
  if (Math.abs(val) < 1e-15) return '0';
  var s = val.toFixed(10);
  return s.replace(/0+$/, '').replace(/\.$/, '');
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    if (!workbenchReady) {
      var banner = document.getElementById('global-error-banner');
      if (banner) banner.style.display = 'flex';
    }
  }, 8000);
});

document.addEventListener('workbench-ready', function (event) {
  workbenchReady = true;
  var banner = document.getElementById('global-error-banner');
  if (banner) banner.style.display = 'none';
  initApp();
});

function initApp() {
  var supabaseClient = supabase;
  if (!supabaseClient) return;

  supabaseClient.auth.onAuthStateChange(function (event) {
    if (event === 'SIGNED_OUT') {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      lastResults = null;
      var results = document.getElementById('results');
      var excelBox = document.getElementById('excel-box');
      if (results) results.style.display = 'none';
      if (excelBox) excelBox.style.display = 'none';
      if (validateRedirectUrl(CONFIG.PORTAL_URL)) {
        window.location.href = CONFIG.PORTAL_URL;
      }
    }
  });
}

function parseInput(inputStr) {
  if (!inputStr) return [];
  return inputStr.trim()
    .replace(/[\s,]+/g, ' ')
    .split(' ')
    .map(function (val) { return parseFloat(val); })
    .filter(function (val) { return !isNaN(val); });
}

function solveLinearSystem(A, B) {
  var n = B.length;
  var i, j, k;
  for (i = 0; i < n; i++) {
    A[i].push(B[i]);
  }

  for (i = 0; i < n; i++) {
    var maxRow = i;
    for (k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    var tmp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tmp;

    if (Math.abs(A[i][i]) < 1e-12) {
      throw new Error('Matriz singular ou mal condicionada');
    }

    for (k = i + 1; k < n; k++) {
      var factor = A[k][i] / A[i][i];
      for (j = i; j <= n; j++) {
        A[k][j] -= factor * A[i][j];
      }
    }
  }

  var x = new Array(n).fill(0);
  for (i = n - 1; i >= 0; i--) {
    if (Math.abs(A[i][i]) < 1e-12) {
      throw new Error('Matriz singular ou mal condicionada');
    }
    var sum = 0;
    for (j = i + 1; j < n; j++) {
      sum += A[i][j] * x[j];
    }
    x[i] = (A[i][n] - sum) / A[i][i];
  }
  return x;
}

function calculateMMQ() {
  var degree = parseInt(document.getElementById('degree').value);
  var xInput = document.getElementById('x-values').value;
  var yInput = document.getElementById('y-values').value;

  var x = parseInput(xInput);
  var y = parseInput(yInput);

  if (x.length !== y.length || x.length === 0) {
    alert('Erro: O n\u00famero de valores de X e Y deve ser o mesmo e n\u00e3o pode ser vazio.');
    return;
  }
  if (x.length <= degree) {
    alert('Erro: Para um polin\u00f4mio de ordem ' + degree + ', voc\u00ea precisa de pelo menos ' + (degree + 1) + ' pontos.');
    return;
  }

  var X_matrix = [];
  var i, j;
  for (i = 0; i < x.length; i++) {
    var row = [];
    for (j = 0; j <= degree; j++) {
      row.push(Math.pow(x[i], j));
    }
    X_matrix.push(row);
  }

  var deg1 = degree + 1;
  var A = Array(deg1).fill(0).map(function () { return Array(deg1).fill(0); });
  var B = Array(deg1).fill(0);

  for (i = 0; i < deg1; i++) {
    for (j = 0; j < deg1; j++) {
      var sum = 0;
      for (var k = 0; k < x.length; k++) {
        sum += X_matrix[k][i] * X_matrix[k][j];
      }
      A[i][j] = sum;
    }

    var sumY = 0;
    for (var k = 0; k < x.length; k++) {
      sumY += X_matrix[k][i] * y[k];
    }
    B[i] = sumY;
  }

  var coeffs;
  try {
    coeffs = solveLinearSystem(A, B);
  } catch (e) {
    alert('Erro no c\u00e1lculo da matriz. Verifique se os dados n\u00e3o geram um sistema singular.');
    return;
  }

  var totalError = 0;
  var yPredicted = [];
  for (i = 0; i < x.length; i++) {
    var yPred = 0;
    for (j = 0; j < coeffs.length; j++) {
      yPred += coeffs[j] * Math.pow(x[i], j);
    }
    yPredicted.push(yPred);
    totalError += Math.pow(y[i] - yPred, 2);
  }

  displayResults(coeffs, totalError, x);
  renderChart(x, y, yPredicted, degree, coeffs);

  document.getElementById('results').style.display = 'flex';
}

function displayResults(coeffs, error, xOriginal) {
  var i;
  var polyStr = 'y = ';
  for (i = coeffs.length - 1; i >= 0; i--) {
    var val = coeffs[i];
    if (Math.abs(val) < 1e-10) continue;

    var sign;
    if (val >= 0) {
      sign = (i === coeffs.length - 1) ? '' : ' + ';
    } else {
      sign = ' - ';
    }
    var absVal = Math.abs(val).toExponential(4).replace('+', '');

    if (i === 0) {
      polyStr += sign + absVal;
    } else if (i === 1) {
      polyStr += sign + absVal + '*x';
    } else {
      polyStr += sign + absVal + '*x^' + i;
    }
  }

  if (polyStr === 'y = ') polyStr = 'y = 0';

  document.getElementById('polynomial-display').innerText = polyStr;
  document.getElementById('error-display').innerText = error.toExponential(4).replace('+', '');

  var excelStr = '=';
  for (i = coeffs.length - 1; i >= 0; i--) {
    var val = coeffs[i];
    if (Math.abs(val) < 1e-10) continue;

    var term = toDecimalStr(val);

    if (val >= 0 && excelStr !== '=') excelStr += '+';

    if (i === 0) {
      excelStr += term;
    } else if (i === 1) {
      excelStr += term + '*x';
    } else {
      excelStr += term + '*x^' + i;
    }
  }
  if (excelStr === '=') excelStr = '=0';

  var excelBox = document.getElementById('excel-box');
  excelBox.style.display = 'flex';
  document.getElementById('excel-formula-display').innerText = excelStr;

  lastResults = {
    coeffs: coeffs,
    error: error,
    polyStr: polyStr,
    excelStr: excelStr,
    xOriginal: xOriginal
  };
}

function renderChart(x, y, yPred, degree, coeffs) {
  if (typeof Chart === 'undefined') {
    var errorState = document.querySelector('.chart-error-state');
    if (errorState) errorState.style.display = 'block';
    return;
  }

  var canvas = document.getElementById('mmqChart');
  if (!canvas) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  var emptyState = document.querySelector('.chart-empty-state');
  var errorState = document.querySelector('.chart-error-state');
  if (emptyState) emptyState.style.display = 'none';
  if (errorState) errorState.style.display = 'none';

  var minX = Math.min.apply(null, x);
  var maxX = Math.max.apply(null, x);
  var range = maxX - minX;
  var step = range / 100;
  var smoothX = [];
  var smoothY = [];

  var startX = minX - (range * 0.05);
  var endX = maxX + (range * 0.05);

  for (var val = startX; val <= endX; val += step) {
    var yp = 0;
    for (var j = 0; j < coeffs.length; j++) {
      yp += coeffs[j] * Math.pow(val, j);
    }
    smoothX.push(val);
    smoothY.push(yp);
  }

  var scatterData = x.map(function (xi, i) { return { x: xi, y: y[i] }; });
  var lineData = smoothX.map(function (xi, i) { return { x: xi, y: smoothY[i] }; });

  var primaryDeep = rootStyles.getPropertyValue('--color-primary-deep').trim() || '#10b981';
  var primary = rootStyles.getPropertyValue('--color-primary').trim() || '#00d992';
  var mute = rootStyles.getPropertyValue('--color-mute').trim() || '#8b949e';
  var hairline = rootStyles.getPropertyValue('--color-hairline').trim() || '#3d3a39';
  var ink = rootStyles.getPropertyValue('--color-ink').trim() || '#f2f2f2';

  var ctx = canvas.getContext('2d');

  chartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Pontos Originais',
          data: scatterData,
          backgroundColor: primaryDeep,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          type: 'line',
          label: 'Ajuste Polinomial (Ordem ' + degree + ')',
          data: lineData,
          borderColor: primary,
          backgroundColor: hexToRgba(primary, 0.1),
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          title: {
            display: true,
            text: 'Eixo X',
            color: mute
          },
          grid: {
            color: hairline
          },
          ticks: {
            color: mute
          }
        },
        y: {
          title: {
            display: true,
            text: 'Eixo Y',
            color: mute
          },
          grid: {
            color: hairline
          },
          ticks: {
            color: mute
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: ink
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      }
    }
  });
}

function copyToExcel() {
  if (!lastResults) {
    alert('Calcule primeiro antes de copiar.');
    return;
  }

  if (!navigator.clipboard) {
    alert('Erro ao copiar: clipboard indisponivel neste navegador.');
    return;
  }

  var textToCopy = lastResults.excelStr;

  navigator.clipboard.writeText(textToCopy).then(function () {
    var btn = document.querySelector('.copy-btn-small');
    var origText = btn.innerText;
    btn.innerText = 'Copiado!';
    setTimeout(function () { btn.innerText = origText; }, 2000);
  }).catch(function (err) {
    alert('Erro ao copiar: ' + err);
  });
}

function calculateNewY() {
  if (!lastResults || !lastResults.coeffs) {
    alert('Por favor, calcule o ajuste original primeiro.');
    return;
  }

  var input = document.getElementById('new-x-values').value;
  var xVals = parseInput(input);

  if (xVals.length === 0) {
    alert('Insira valores de X para calcular.');
    return;
  }

  var coeffs = lastResults.coeffs;
  var results = [];

  xVals.forEach(function (x) {
    var y = 0;
    for (var j = 0; j < coeffs.length; j++) {
      y += coeffs[j] * Math.pow(x, j);
    }
    results.push('X=' + x + ' -> Y=' + y.toPrecision(6));
  });

  var resultBox = document.getElementById('prediction-result');
  var resultText = document.getElementById('new-y-values');

  resultBox.style.display = 'block';
  resultText.innerText = results.join('\n');

  if (chartInstance) {
    var simulatedData = xVals.map(function (val) {
      var y = 0;
      for (var j = 0; j < coeffs.length; j++) {
        y += coeffs[j] * Math.pow(val, j);
      }
      return { x: val, y: y };
    });

    var simDataset = chartInstance.data.datasets.find(function (ds) {
      return ds.label === 'Pontos Simulados';
    });

    var amber = '#f59e0b';

    if (simDataset) {
      simDataset.data = simulatedData;
    } else {
      chartInstance.data.datasets.push({
        label: 'Pontos Simulados',
        data: simulatedData,
        backgroundColor: amber,
        pointRadius: 7,
        pointHoverRadius: 9,
        pointStyle: 'triangle'
      });
    }

    if (lastResults.xOriginal) {
      var allX = lastResults.xOriginal.concat(xVals);
      var minX = Math.min.apply(null, allX);
      var maxX = Math.max.apply(null, allX);
      var range = maxX - minX;
      var startX = minX - (range * 0.05);
      var endX = maxX + (range * 0.05);
      var step = (endX - startX) / 100;

      var newLineData = [];
      for (var val = startX; val <= endX; val += step) {
        var yp = 0;
        for (var j = 0; j < coeffs.length; j++) {
          yp += coeffs[j] * Math.pow(val, j);
        }
        newLineData.push({ x: val, y: yp });
      }

      if (chartInstance.data.datasets[1]) {
        chartInstance.data.datasets[1].data = newLineData;
      }
    }

    chartInstance.update();
  }
}
