import * as math from 'mathjs';

const idT = (k) => k;

export function computeDerivative(expr, variable = 'x', order = 1, t = idT) {
  try {
    let node = math.parse(expr);
    const steps = [{ label: t('cm.step.original'), latex: `f(${variable}) = ${math.parse(expr).toTex()}` }];
    for (let i = 0; i < order; i++) {
      node = math.derivative(node, variable);
      steps.push({
        label: t('cm.step.nthDeriv', { n1: i + 1, n2: i + 2 }),
        latex: `f^{(${i + 1})}(${variable}) = ${node.toTex()}`
      });
    }
    const simplified = math.simplify(node);
    steps.push({ label: t('cm.step.simplified'), latex: simplified.toTex() });
    return { latex: simplified.toTex(), steps, expr: simplified.toString() };
  } catch (e) {
    throw new Error(t('cm.err.deriv') + e.message);
  }
}

export function computePartialDerivative(expr, variable = 'x', t = idT) {
  try {
    const node = math.parse(expr);
    const vars = ['x', 'y', 'z'].filter(v => expr.includes(v));
    const steps = [
      { label: t('cm.step.original'), latex: `f(${vars.join(',')}) = ${node.toTex()}` },
      { label: t('cm.step.partialFrom', { v: variable }), latex: '' },
    ];
    const deriv = math.derivative(node, variable);
    const simplified = math.simplify(deriv);
    steps[1].latex = `\\frac{\\partial f}{\\partial ${variable}} = ${simplified.toTex()}`;
    steps.push({ label: t('cm.step.result'), latex: simplified.toTex() });
    return { latex: `\\frac{\\partial f}{\\partial ${variable}} = ${simplified.toTex()}`, steps };
  } catch (e) {
    throw new Error(t('cm.err.partial') + e.message);
  }
}

export function computeIntegral(expr, variable = 'x', lower = null, upper = null, t = idT) {
  try {
    const node = math.parse(expr);
    const steps = [{ label: t('cm.step.integrand'), latex: node.toTex() }];

    if (lower !== null && upper !== null) {
      const lo = math.evaluate(String(lower));
      const hi = math.evaluate(String(upper));
      const n = 1000;
      const h = (hi - lo) / n;
      let sum = 0;
      const scope = {};
      for (let i = 0; i <= n; i++) {
        scope[variable] = lo + i * h;
        const w = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
        try { sum += w * math.evaluate(expr, scope); } catch {}
      }
      const result = (h / 3) * sum;
      steps.push({ label: t('cm.step.simpson'), latex: `\\int_{${lower}}^{${upper}} ${node.toTex()} \\, d${variable}` });
      steps.push({ label: t('cm.step.result'), latex: `= ${math.round(result, 8)}` });
      return {
        latex: `\\int_{${lower}}^{${upper}} ${node.toTex()} \\, d${variable} = ${math.round(result, 8)}`,
        steps,
        value: result
      };
    } else {
      steps.push({ label: t('cm.step.antideriv'), latex: `\\int ${node.toTex()} \\, d${variable}` });
      steps.push({ label: t('cm.step.numericNote'), latex: `\\int ${node.toTex()} \\, d${variable} + C` });
      return {
        latex: `\\int ${node.toTex()} \\, d${variable} + C`,
        steps,
        note: t('cm.note.enterBounds')
      };
    }
  } catch (e) {
    throw new Error(t('cm.err.integral') + e.message);
  }
}

export function computeLimit(expr, variable = 'x', point = '0', direction = 'both', t = idT) {
  try {
    const node = math.parse(expr);
    const steps = [{ label: t('cm.step.original'), latex: node.toTex() }];
    const p = math.evaluate(String(point).replace('Infinity', '1e15').replace('-Infinity', '-1e15'));
    const epsilon = 1e-8;
    const scope = {};
    let left, right, result;

    if (direction !== 'right') {
      scope[variable] = p - epsilon;
      try { left = math.evaluate(expr, scope); } catch { left = null; }
    }
    if (direction !== 'left') {
      scope[variable] = p + epsilon;
      try { right = math.evaluate(expr, scope); } catch { right = null; }
    }

    if (direction === 'left') result = left;
    else if (direction === 'right') result = right;
    else {
      if (left !== null && right !== null && Math.abs(left - right) < 1e-5) result = (left + right) / 2;
      else result = null;
    }

    const dirLabel = direction === 'left' ? '^-' : direction === 'right' ? '^+' : '';
    const limitLatex = `\\lim_{${variable} \\to ${point}${dirLabel}} \\left( ${node.toTex()} \\right)`;

    if (result === null || !isFinite(result)) {
      steps.push({ label: t('cm.step.limitDNE'), latex: `${limitLatex} = \\nexists` });
      return { latex: `${limitLatex} = \\text{${t('cm.latex.dne')}}`, steps };
    }

    steps.push({ label: t('cm.step.limitNumeric', { point, dir: dirLabel }), latex: `${limitLatex} \\approx ${math.round(result, 6)}` });
    return { latex: `${limitLatex} = ${math.round(result, 6)}`, steps, value: result };
  } catch (e) {
    throw new Error(t('cm.err.limit') + e.message);
  }
}

// ── Taylor helpers ────────────────────────────────────────────────────────
function fnTex(n, aStr) {
  if (n === 0) return `f(${aStr})`;
  if (n === 1) return `f'(${aStr})`;
  if (n === 2) return `f''(${aStr})`;
  return `f^{(${n})}(${aStr})`;
}

function termTex(c, n, p, v) {
  if (n === 0) return String(c);
  const xPart = p === 0
    ? (n === 1 ? v : `${v}^{${n}}`)
    : (n === 1 ? `(${v} - ${p})` : `(${v} - ${p})^{${n}}`);
  if (c === 1)  return xPart;
  if (c === -1) return `-${xPart}`;
  return `${c}\\,${xPart}`;
}

export function computeTaylor(expr, variable = 'x', point = 0, order = 5, t = idT) {
  try {
    const p = Number(point);
    const aStr = String(p);
    let derivNode = math.parse(expr);

    const xTermTex = p === 0
      ? `${variable}^n`
      : `(${variable} - ${p})^n`;

    const steps = [
      {
        label: t('cm.step.taylorOriginal'),
        latex: `f(${variable}) = ${derivNode.toTex()}`
      },
      {
        label: t('cm.step.taylorFormula', { a: aStr }),
        latex: `f(${variable}) \\approx \\sum_{n=0}^{N} \\frac{f^{(n)}(${aStr})}{n!} \\cdot ${xTermTex}`
      },
    ];

    const scope = { [variable]: p };
    const terms = [];
    let factorial = 1;

    for (let n = 0; n <= order; n++) {
      if (n > 0) {
        derivNode = math.derivative(derivNode, variable);
        factorial *= n;
      }

      let fnVal;
      try { fnVal = math.evaluate(derivNode.toString(), scope); } catch { fnVal = 0; }
      if (!isFinite(fnVal)) fnVal = 0;

      const coeff = math.round(fnVal / factorial, 6);
      const isZero = Math.abs(coeff) < 1e-10;
      const ftex = fnTex(n, aStr);
      const fvStr = String(math.round(fnVal, 4));

      if (isZero) {
        steps.push({
          label: t('cm.step.taylorZero', { n }),
          latex: n <= 1
            ? `${ftex} = 0`
            : `${ftex} = ${fvStr}, \\quad \\dfrac{${fvStr}}{${n}!} = 0`
        });
      } else {
        const tt = termTex(coeff, n, p, variable);
        steps.push({
          label: t('cm.step.taylorCoeff', { n, coeff }),
          latex: n <= 1
            ? `${ftex} = ${coeff} \\;\\Longrightarrow\\; ${tt}`
            : `${ftex} = ${fvStr},\\quad \\dfrac{${fvStr}}{${n}!} = ${coeff} \\;\\Longrightarrow\\; ${tt}`
        });
        terms.push({ n, c: coeff });
      }
    }

    if (!terms.length) {
      return { latex: `f(${variable}) \\approx 0`, steps, poly: '0' };
    }

    // Assemble series: join with + / -, handle leading minus
    const parts = terms.map(({ n, c }) => termTex(c, n, p, variable));
    let series = parts[0];
    for (let i = 1; i < parts.length; i++) {
      series += parts[i].startsWith('-') ? ` ${parts[i]}` : ` + ${parts[i]}`;
    }
    const rem = p === 0
      ? `O(${variable}^{${order + 1}})`
      : `O\\!\\left((${variable} - ${p})^{${order + 1}}\\right)`;
    series += ` + ${rem}`;

    steps.push({
      label: t('cm.step.taylorSeries'),
      latex: `f(${variable}) \\approx ${series}`
    });

    // Build a mathjs-evaluable polynomial string for graph visualization
    const polyParts = terms.map(({ n, c }) => {
      if (n === 0) return String(c);
      const xPart = p === 0
        ? (n === 1 ? variable : `${variable}^${n}`)
        : (n === 1 ? `(${variable} - ${p})` : `(${variable} - ${p})^${n}`);
      return `${c} * ${xPart}`;
    });
    const poly = polyParts.join(' + ') || '0';

    return { latex: `f(${variable}) \\approx ${series}`, steps, poly };
  } catch (e) {
    throw new Error(t('cm.err.taylor') + e.message);
  }
}
