document.addEventListener('DOMContentLoaded', () => {
    let currentFunc = 'sin';

    const DOM = {
        sliderA: document.getElementById('slider-a'),
        sliderB: document.getElementById('slider-b'),
        sliderC: document.getElementById('slider-c'),
        sliderD: document.getElementById('slider-d'),
        valA: document.getElementById('val-a'),
        valB: document.getElementById('val-b'),
        valC: document.getElementById('val-c'),
        valD: document.getElementById('val-d'),
        optA: document.getElementById('opt-a'),
        optB: document.getElementById('opt-b'),
        dynamicPanelFormula: document.getElementById('dynamic-panel-formula'),
        resFormula: document.getElementById('res-formula'),
        resPeriod: document.getElementById('res-period'),
        resMax: document.getElementById('res-max'),
        resMin: document.getElementById('res-min'),
        resAsym: document.getElementById('res-asymptote'),
        basePanelFormula: document.getElementById('base-panel-formula'),
        basePeriod: document.getElementById('base-period'),
        baseAsym: document.getElementById('base-asymptote'),
        navBtns: document.querySelectorAll('.nav-btn'),
        statMaxMins: document.querySelectorAll('.stat-max-min'),
        statAsyms: document.querySelectorAll('.stat-asym')
    };

    const plotLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 20, r: 20, b: 40, l: 40 },
        xaxis: {
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.5)',
            tickfont: { color: '#cbd5e1' },
            tickvals: [-2*Math.PI, -1.5*Math.PI, -Math.PI, -0.5*Math.PI, 0, 0.5*Math.PI, Math.PI, 1.5*Math.PI, 2*Math.PI],
            ticktext: ['-2π', '-3π/2', '-π', '-π/2', '0', 'π/2', 'π', '3π/2', '2π'],
            range: [-2*Math.PI - 0.5, 2*Math.PI + 0.5]
        },
        yaxis: {
            gridcolor: 'rgba(255,255,255,0.1)',
            zerolinecolor: 'rgba(255,255,255,0.5)',
            tickfont: { color: '#cbd5e1' },
            range: [-5, 5]
        },
        showlegend: false
    };

    const config = { responsive: true, displayModeBar: false };

    const getBaseDataAndTraces = () => {
        const x = [];
        const y = [];
        const points = 2000;
        const xMin = -2 * Math.PI;
        const xMax = 2 * Math.PI;
        const step = (xMax - xMin) / points;
        
        for(let i = 0; i <= points; i++) {
            let cx = xMin + i * step;
            x.push(cx);
            let cy;
            if (currentFunc === 'sin') cy = Math.sin(cx);
            else if (currentFunc === 'cos') cy = Math.cos(cx);
            else if (currentFunc === 'tan') cy = Math.tan(cx);
            
            if (currentFunc === 'tan' && Math.abs(cy) > 20) {
                cy = null;
            }
            y.push(cy);
        }
        
        const traces = [{ x, y, type: 'scatter', mode: 'lines', line: { color: '#38bdf8', width: 3 }, name: '기본' }];

        if (currentFunc === 'tan') {
            for(let n = -3; n <= 3; n++) {
                let ax = n * Math.PI + Math.PI / 2;
                if (ax >= xMin && ax <= xMax) {
                    traces.push({
                        x: [ax, ax],
                        y: [-20, 20],
                        type: 'scatter', mode: 'lines',
                        line: { color: 'rgba(255,255,255,0.3)', width: 1.5, dash: 'dot' },
                        hoverinfo: 'skip', showlegend: false
                    });
                }
            }
        }
        return traces;
    };

    Plotly.newPlot('base-plot', getBaseDataAndTraces(), plotLayout, config);
    Plotly.newPlot('dynamic-plot', [{x: [], y: [], type: 'scatter'}], plotLayout, config);

    const formatNumber = (num) => Number.isInteger(num) ? num.toString() : num.toFixed(2).replace(/\.?0+$/, '');

    const formatAsymptote = (b, cInput, isOptB) => {
        if (b === 0) return '\\text{없음}';
        let lhs = isOptB ? '|x|' : 'x';
        
        let t1 = '';
        if (b === 1) t1 = 'n\\pi';
        else if (b === -1) t1 = '-n\\pi';
        else t1 = `\\frac{n\\pi}{${formatNumber(b)}}`;

        let t2 = '';
        let db = 2 * b;
        if (db === 1) t2 = '+ \\pi';
        else if (db === -1) t2 = '- \\pi';
        else if (db > 0) t2 = `+ \\frac{\\pi}{${formatNumber(db)}}`;
        else t2 = `- \\frac{\\pi}{${formatNumber(Math.abs(db))}}`;

        let t3 = '';
        if (cInput > 0) t3 = `+ ${cInput === 1 ? '\\pi' : formatNumber(cInput) + '\\pi'}`;
        else if (cInput < 0) t3 = ` ${cInput === -1 ? '-\\pi' : formatNumber(cInput) + '\\pi'}`;

        return `${lhs} = ${t1} ${t2} ${t3}`;
    };

    const formatFormula = (func, a, b, cInput, d, isOptA, isOptB) => {
        let innerX = isOptB ? '|x|' : 'x';
        
        let bStr = '';
        if (b === 1) bStr = '';
        else if (b === -1) bStr = '-';
        else bStr = formatNumber(b);

        let cStr = '';
        if (cInput > 0) {
            cStr = cInput === 1 ? ' - \\pi' : ` - ${formatNumber(cInput)}\\pi`;
        } else if (cInput < 0) {
            cStr = cInput === -1 ? ' + \\pi' : ` + ${formatNumber(Math.abs(cInput))}\\pi`;
        }

        let innerTerm = '';
        if (b === 0) innerTerm = '0';
        else if (cInput === 0) innerTerm = `${bStr}${innerX}`;
        else innerTerm = `${bStr}(${innerX}${cStr})`;

        let term = `\\${func}(${innerTerm})`;

        let aStr = '';
        if (a === 1) aStr = '';
        else if (a === -1) aStr = '-';
        else if (a === 0) {
            term = '';
            aStr = '0';
        } else aStr = formatNumber(a);

        let fx = a === 0 ? '0' : `${aStr}${term}`;

        let dStr = '';
        if (d > 0) dStr = (fx === '0' ? `${formatNumber(d)}` : ` + ${formatNumber(d)}`);
        else if (d < 0) dStr = (fx === '0' ? `-${formatNumber(Math.abs(d))}` : ` - ${formatNumber(Math.abs(d))}`);

        let fullFx = fx === '0' ? (d === 0 ? '0' : dStr) : fx + dStr;

        if (isOptA) {
            fullFx = `|${fullFx}|`;
        }

        return `y = ${fullFx}`;
    };

    const updateBaseInfo = () => {
        let baseFormulaStr = '';
        let basePeriodStr = '';
        if (currentFunc === 'sin') {
            baseFormulaStr = 'y = \\sin(x)';
            basePeriodStr = '2\\pi';
        } else if (currentFunc === 'cos') {
            baseFormulaStr = 'y = \\cos(x)';
            basePeriodStr = '2\\pi';
        } else {
            baseFormulaStr = 'y = \\tan(x)';
            basePeriodStr = '\\pi';
            katex.render('x = n\\pi + \\frac{\\pi}{2}', DOM.baseAsym, { throwOnError: false, displayMode: false });
        }
        
        katex.render(baseFormulaStr, DOM.basePanelFormula, { throwOnError: false, displayMode: true });
        katex.render(basePeriodStr, DOM.basePeriod, { throwOnError: false, displayMode: false });
    };

    const updateInfo = (a, b, cInput, d, isOptA, isOptB, finalMax, finalMin) => {
        const formulaStr = formatFormula(currentFunc, a, b, cInput, d, isOptA, isOptB);
        katex.render(formulaStr, DOM.resFormula, { throwOnError: false, displayMode: false });
        katex.render(formulaStr, DOM.dynamicPanelFormula, { throwOnError: false, displayMode: true });

        if (b === 0) {
            DOM.resPeriod.innerHTML = '없음';
        } else {
            const defaultPeriod = currentFunc === 'tan' ? 1 : 2;
            const periodVal = (defaultPeriod / Math.abs(b));
            let periodStr = '';
            if (periodVal === 1) periodStr = '\\pi';
            else periodStr = `${formatNumber(periodVal)}\\pi`;
            katex.render(periodStr, DOM.resPeriod, { throwOnError: false, displayMode: false });
        }

        if (currentFunc === 'tan') {
            const asymStr = formatAsymptote(b, cInput, isOptB);
            katex.render(asymStr, DOM.resAsym, { throwOnError: false, displayMode: false });
        } else {
            DOM.resMax.textContent = formatNumber(finalMax);
            DOM.resMin.textContent = formatNumber(finalMin);
        }
    };

    const updateDynamicGraph = () => {
        const a = parseFloat(DOM.sliderA.value);
        const b = parseFloat(DOM.sliderB.value);
        const cInput = parseFloat(DOM.sliderC.value);
        const c = cInput * Math.PI;
        const d = parseFloat(DOM.sliderD.value);
        const isOptA = DOM.optA.checked;
        const isOptB = DOM.optB.checked;

        DOM.valA.textContent = a;
        DOM.valB.textContent = b;
        DOM.valC.textContent = cInput === 0 ? '0' : (cInput === 1 ? 'π' : (cInput === -1 ? '-π' : `${cInput}π`));
        DOM.valD.textContent = d;

        const xVals = [];
        const yVals = [];
        const points = 2000;
        const xMin = -2 * Math.PI;
        const xMax = 2 * Math.PI;
        const step = (xMax - xMin) / points;

        for(let i = 0; i <= points; i++) {
            let x = xMin + i * step;
            if (Math.abs(x) < 1e-10) x = 0;
            xVals.push(x);
            
            let currentX = x;
            if(isOptB) {
                currentX = Math.abs(currentX);
            }
            
            let y;
            let val = b * (currentX - c);
            if (currentFunc === 'sin') y = Math.sin(val);
            else if (currentFunc === 'cos') y = Math.cos(val);
            else if (currentFunc === 'tan') y = Math.tan(val);
            
            y = a * y + d;

            if (currentFunc === 'tan' && Math.abs(y) > 20) {
                y = null;
            } else if(isOptA && y !== null) {
                y = Math.abs(y);
            }
            yVals.push(y);
        }

        let minF = -Math.abs(a) + d;
        let maxF = Math.abs(a) + d;
        let finalMax, finalMin;

        if (isOptA) {
            finalMax = Math.max(Math.abs(minF), Math.abs(maxF));
            if (minF <= 0 && maxF >= 0) {
                finalMin = 0;
            } else {
                finalMin = Math.min(Math.abs(minF), Math.abs(maxF));
            }
        } else {
            finalMax = maxF;
            finalMin = minF;
        }

        let yRangeBound = 5;
        if (currentFunc === 'tan') {
            yRangeBound = 5; // Force fixed scale for Tan
        } else {
            const validY = yVals.filter(v => v !== null);
            const currentMaxY = Math.max(...validY);
            const currentMinY = Math.min(...validY);
            yRangeBound = Math.max(5, Math.abs(currentMaxY) + 1, Math.abs(currentMinY) + 1);
        }

        const dynamicLayout = {
            ...plotLayout,
            yaxis: {
                ...plotLayout.yaxis,
                range: [-yRangeBound, yRangeBound]
            }
        };

        const traces = [{ x: xVals, y: yVals, type: 'scatter', mode: 'lines', line: { color: '#c084fc', width: 3 }, name: '그래프' }];

        if (currentFunc === 'tan') {
            if (b !== 0) {
                for (let n = -10; n <= 10; n++) {
                    let ax_base = (n * Math.PI) / b + (Math.PI) / (2 * b) + c;
                    let ax_list = [];
                    if (isOptB) {
                        if (ax_base > 0) {
                            ax_list.push(ax_base, -ax_base);
                        } else if (Math.abs(ax_base) < 1e-10) {
                            ax_list.push(0);
                        }
                    } else {
                        ax_list.push(ax_base);
                    }
                    
                    ax_list.forEach(ax => {
                        if (ax >= xMin && ax <= xMax) {
                            traces.push({
                                x: [ax, ax],
                                y: [-20, 20],
                                type: 'scatter', mode: 'lines',
                                line: { color: 'rgba(255,255,255,0.3)', width: 1.5, dash: 'dot' },
                                hoverinfo: 'skip', showlegend: false
                            });
                        }
                    });
                }
            }
        } else {
            traces.push({ x: [xMin, xMax], y: [finalMax, finalMax], type: 'scatter', mode: 'lines', line: { color: 'rgba(244, 63, 94, 0.7)', width: 2, dash: 'dash' }, hoverinfo: 'skip', name: '최댓값' });
            traces.push({ x: [xMin, xMax], y: [finalMin, finalMin], type: 'scatter', mode: 'lines', line: { color: 'rgba(56, 189, 248, 0.7)', width: 2, dash: 'dash' }, hoverinfo: 'skip', name: '최솟값' });
        }

        Plotly.react('dynamic-plot', traces, dynamicLayout, config);

        updateInfo(a, b, cInput, d, isOptA, isOptB, finalMax, finalMin);
    };

    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            DOM.navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFunc = e.target.getAttribute('data-func');
            
            if (currentFunc === 'tan') {
                DOM.statMaxMins.forEach(el => el.style.display = 'none');
                DOM.statAsyms.forEach(el => el.style.display = 'flex');
            } else {
                DOM.statMaxMins.forEach(el => el.style.display = 'flex');
                DOM.statAsyms.forEach(el => el.style.display = 'none');
            }

            updateBaseInfo();
            Plotly.react('base-plot', getBaseDataAndTraces(), plotLayout, config);
            updateDynamicGraph();
        });
    });

    [DOM.sliderA, DOM.sliderB, DOM.sliderC, DOM.sliderD, DOM.optA, DOM.optB].forEach(el => {
        el.addEventListener('input', updateDynamicGraph);
        el.addEventListener('change', updateDynamicGraph);
    });

    updateBaseInfo();
    updateDynamicGraph();
});
