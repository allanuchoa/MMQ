let chartInstance = null;

function parseInput(inputStr) {
    if (!inputStr) return [];
    // Replace multiple spaces/newlines with single space, split by comma or space
    return inputStr.trim()
        .replace(/[\s,]+/g, ' ')
        .split(' ')
        .map(val => parseFloat(val))
        .filter(val => !isNaN(val));
}

function solveLinearSystem(A, B) {
    // Gaussian elimination with partial pivoting
    const n = B.length;
    // Augment A with B
    for (let i = 0; i < n; i++) {
        A[i].push(B[i]);
    }

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }
        
        // Swap rows
        [A[i], A[maxRow]] = [A[maxRow], A[i]];

        // Make triangular
        for (let k = i + 1; k < n; k++) {
            const factor = A[k][i] / A[i][i];
            for (let j = i; j <= n; j++) {
                A[k][j] -= factor * A[i][j];
            }
        }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (A[i][n] - sum) / A[i][i];
    }
    return x;
}

function calculateMMQ() {
    const degree = parseInt(document.getElementById('degree').value);
    const xInput = document.getElementById('x-values').value;
    const yInput = document.getElementById('y-values').value;

    const x = parseInput(xInput);
    const y = parseInput(yInput);

    // Validation
    if (x.length !== y.length || x.length === 0) {
        alert("Erro: O número de valores de X e Y deve ser o mesmo e não pode ser vazio.");
        return;
    }
    if (x.length <= degree) {
        alert(`Erro: Para um polinômio de ordem ${degree}, você precisa de pelo menos ${degree + 1} pontos.`);
        return;
    }

    // 1. Construct V matrix (Vandermonde-like: [1, x, x^2...])
    // The coefficients will be [a0, a1, a2...] for a0 + a1*x + a2*x^2...
    // X_matrix size is N x (degree+1)
    const X_matrix = [];
    for (let i = 0; i < x.length; i++) {
        const row = [];
        for (let j = 0; j <= degree; j++) {
            row.push(Math.pow(x[i], j));
        }
        X_matrix.push(row);
    }

    // 2. Compute Normal Equation: (X^T * X) * coeffs = X^T * Y
    // A = X^T * X  (size: degree+1 x degree+1)
    // B = X^T * Y  (size: degree+1)
    
    const deg1 = degree + 1;
    const A = Array(deg1).fill(0).map(() => Array(deg1).fill(0));
    const B = Array(deg1).fill(0);

    // Compute A and B
    for (let i = 0; i < deg1; i++) {
        for (let j = 0; j < deg1; j++) {
            let sum = 0;
            for (let k = 0; k < x.length; k++) {
                sum += X_matrix[k][i] * X_matrix[k][j];
            }
            A[i][j] = sum;
        }
        
        let sumY = 0;
        for (let k = 0; k < x.length; k++) {
            sumY += X_matrix[k][i] * y[k];
        }
        B[i] = sumY;
    }

    // 3. Solve for coeffs
    let coeffs;
    try {
        coeffs = solveLinearSystem(A, B);
    } catch (e) {
        alert("Erro no cálculo da matriz. Verifique se os dados não geram um sistema singular.");
        return;
    }

    // 4. Calculate Error (Squared Residuals)
    let totalError = 0;
    const yPredicted = [];
    for (let i = 0; i < x.length; i++) {
        let yPred = 0;
        for (let j = 0; j < coeffs.length; j++) {
            yPred += coeffs[j] * Math.pow(x[i], j);
        }
        yPredicted.push(yPred);
        totalError += Math.pow(y[i] - yPred, 2);
    }

    displayResults(coeffs, totalError, x);
    renderChart(x, y, yPredicted, degree, coeffs);
    
    // Show results section
    document.getElementById('results').style.display = 'flex';
}

function displayResults(coeffs, error, xOriginal) {
    // Format polynomial string: y = a + bx + cx^2 ...
    let polyStr = "y = ";
    for (let i = coeffs.length - 1; i >= 0; i--) {
        const val = coeffs[i];
        if (Math.abs(val) < 1e-10) continue; // Skip near-zero terms
        
        const sign = val >= 0 ? (i === coeffs.length - 1 ? "" : " + ") : " - ";
        const absVal = Math.abs(val).toExponential(4); // Use scientific notation for precision
        
        if (i === 0) {
            polyStr += `${sign}${absVal}`;
        } else if (i === 1) {
            polyStr += `${sign}${absVal}*x`;
        } else {
            polyStr += `${sign}${absVal}*x^${i}`;
        }
    }
    
    // Fallback if all coeffs are ~0
    if (polyStr === "y = ") polyStr = "y = 0";

    document.getElementById('polynomial-display').innerText = polyStr;
    document.getElementById('error-display').innerText = error.toExponential(4);
    
    // Generate Excel Formula
    // Form: =c0 + c1*x + c2*x^2 ...
    // Note: User asked to "maintain X".
    let excelStr = "=";
    for (let i = coeffs.length - 1; i >= 0; i--) {
        const val = coeffs[i];
        if (Math.abs(val) < 1e-10) continue;
        
        let term = val.toString(); // Keep dots for now, standard scientific notation is usually OK in modern Excel or handled by user locale settings if they paste as text? 
        // Actually, let's try to be smart. If the user locale is PT-BR, they might want commas.
        // But "Copy" usually copies the raw string. 
        // Let's replace 'e' with '*10^' maybe? No, Excel understands 1.2E-3.
        // Let's just use the number as is.
        
        if (val >= 0 && excelStr !== "=") excelStr += "+";
        
        if (i === 0) {
            excelStr += term;
        } else if (i === 1) {
            excelStr += term + "*x";
        } else {
            excelStr += term + "*x^" + i;
        }
    }
    if (excelStr === "=") excelStr = "=0";

    // Show Excel Box and set content
    const excelBox = document.getElementById('excel-box');
    excelBox.style.display = 'flex';
    document.getElementById('excel-formula-display').innerText = excelStr;

    // Store for Excel copy
    window.lastResults = {
        coeffs: coeffs,
        error: error,
        polyStr: polyStr,
        excelStr: excelStr,
        xOriginal: xOriginal
    };
}

function renderChart(x, y, yPred, degree, coeffs) {
    const ctx = document.getElementById('mmqChart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Generate smooth line points for the curve
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const range = maxX - minX;
    const step = range / 100; // 100 points for smooth line
    const smoothX = [];
    const smoothY = [];
    
    // Add margin to graph
    const startX = minX - (range * 0.05);
    const endX = maxX + (range * 0.05);

    for (let val = startX; val <= endX; val += step) {
        let yp = 0;
        for (let j = 0; j < coeffs.length; j++) {
            yp += coeffs[j] * Math.pow(val, j);
        }
        smoothX.push(val);
        smoothY.push(yp);
    }

    const scatterData = x.map((xi, i) => ({ x: xi, y: y[i] }));
    const lineData = smoothX.map((xi, i) => ({ x: xi, y: smoothY[i] }));

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Pontos Originais',
                    data: scatterData,
                    backgroundColor: '#10b981', // Success green
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    type: 'line',
                    label: `Ajuste Polinomial (Ordem ${degree})`,
                    data: lineData,
                    borderColor: '#3b82f6', // Accent blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0, // Hide points on the line
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
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Eixo Y',
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
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
    if (!window.lastResults) {
        alert("Calcule primeiro antes de copiar.");
        return;
    }
    
    const textToCopy = window.lastResults.excelStr;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback on the small button inside the box if it exists, 
        // or just alert if we want.
        const btn = document.querySelector('.copy-btn-small');
        const origText = btn.innerText;
        btn.innerText = "Copiado!";
        setTimeout(() => btn.innerText = origText, 2000);
    }).catch(err => {
        alert("Erro ao copiar: " + err);
    });
}

function calculateNewY() {
    if (!window.lastResults || !window.lastResults.coeffs) {
        alert("Por favor, calcule o ajuste original primeiro.");
        return;
    }

    const input = document.getElementById('new-x-values').value;
    const xVals = parseInput(input);
    
    if (xVals.length === 0) {
        alert("Insira valores de X para calcular.");
        return;
    }

    const coeffs = window.lastResults.coeffs;
    const results = [];

    // y = a0 + a1*x + a2*x^2 ...
    xVals.forEach(x => {
        let y = 0;
        for (let j = 0; j < coeffs.length; j++) {
            y += coeffs[j] * Math.pow(x, j); // coeffs are [a0, a1, a2...]
        }
        results.push(`X=${x} -> Y=${y.toPrecision(6)}`);
    });

    const resultBox = document.getElementById('prediction-result');
    const resultText = document.getElementById('new-y-values');
    
    resultBox.style.display = 'block';
    resultText.innerText = results.join('\n');

    // Add/Update Simulated Points on Chart
    if (chartInstance) {
        const simulatedData = xVals.map((val, idx) => {
            // Re-calculate y to be sure, or parse from string? clearer to use the calc val
            let y = 0;
            for (let j = 0; j < coeffs.length; j++) {
                y += coeffs[j] * Math.pow(val, j);
            }
            return { x: val, y: y };
        });

        // Check if simulation dataset already exists
        let simDataset = chartInstance.data.datasets.find(ds => ds.label === 'Pontos Simulados');
        
        if (simDataset) {
            simDataset.data = simulatedData;
        } else {
            chartInstance.data.datasets.push({
                label: 'Pontos Simulados',
                data: simulatedData,
                backgroundColor: '#f59e0b', // Amber/Orange
                pointRadius: 7,
                pointHoverRadius: 9,
                pointStyle: 'triangle'
            });
        }

        // RE-GENERATE FITTED LINE TO COVER NEW RANGE
        if (window.lastResults.xOriginal) {
            const allX = [...window.lastResults.xOriginal, ...xVals];
            const minX = Math.min(...allX);
            const maxX = Math.max(...allX);
            const range = maxX - minX;
            // Add padding
            const startX = minX - (range * 0.05);
            const endX = maxX + (range * 0.05);
            const step = (endX - startX) / 100;

            const newLineData = [];
            for (let val = startX; val <= endX; val += step) {
                let yp = 0;
                for (let j = 0; j < coeffs.length; j++) {
                    yp += coeffs[j] * Math.pow(val, j);
                }
                newLineData.push({ x: val, y: yp });
            }

            // Update the line dataset (index 1)
            // Assuming index 1 is always the fitted line as per renderChart
            if (chartInstance.data.datasets[1]) {
                chartInstance.data.datasets[1].data = newLineData;
            }
        }

        chartInstance.update();
    }
}
