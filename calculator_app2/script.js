let expression = '';
let lastResult = null;

const display = document.getElementById('display');
const history = document.getElementById('history');

const updateDisplay = (val) => {
    display.innerText = val || '0';
};

const updateHistory = (val) => {
    history.innerText = val || '';
};

document.querySelectorAll('[data-num]').forEach(btn => {
    btn.addEventListener('click', () => {
        const num = btn.getAttribute('data-num');
        if (lastResult !== null && !isNaN(num)) {
            expression = '';
            lastResult = null;
        }
        expression += num;
        updateDisplay(expression);
    });
});

document.querySelectorAll('[data-op]').forEach(btn => {
    btn.addEventListener('click', () => {
        const op = btn.getAttribute('data-op');
        if (expression === '' && lastResult !== null) {
            expression = lastResult.toString();
        }
        if (expression !== '' && !['+', '-', '*', '/'].includes(expression.slice(-1))) {
            expression += op;
            updateDisplay(expression);
        }
        lastResult = null;
    });
});

document.getElementById('clear').addEventListener('click', () => {
    expression = '';
    lastResult = null;
    updateDisplay('0');
    updateHistory('');
});

document.getElementById('delete').addEventListener('click', () => {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
});

document.getElementById('equals').addEventListener('click', () => {
    if (expression === '') return;
    try {
        // Simple evaluation using Function constructor (slightly safer than eval, but still needs care)
        // For a production app, a proper parser would be better.
        const result = Function('"use strict";return (' + expression + ')')();
        updateHistory(expression + ' =');
        const formattedResult = Number.isInteger(result) ? result : result.toFixed(8).replace(/\.?0+$/, "");
        updateDisplay(formattedResult);
        lastResult = formattedResult;
        expression = '';
    } catch (e) {
        updateDisplay('Error');
        expression = '';
    }
});

// PWA Install Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA installable prompt saved');
});
