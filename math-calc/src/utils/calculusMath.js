import * as math from 'mathjs';

export function computeDerivative(expr, variable = 'x', order = 1) {
  try {
    let node = math.parse(expr);
    const steps = [{ label: 'Step 1: 원본 함수', latex: `f(${variable}) = ${math.parse(expr).toTex()}` }];
    for (let i = 0; i < order; i++) {
      node = math.derivative(node, variable);
      steps.push({
        label: `Step ${i + 2}: ${i + 1}차 도함수`,
        latex: `f^{(${i + 1})}(${variable}) = ${node.toTex()}`
      });
    }
    const simplified = math.simplify(node);
    steps.push({ label: '결과 (간소화)', latex: simplified.toTex() });
    return { latex: simplified.toTex(), steps, expr: simplified.toString() };
  } catch (e) {
    throw new Error('미분 계산 실패: ' + e.message);
  }
}

export function computePartialDerivative(expr, variable = 'x') {
  try {
    const node = math.parse(expr);
    const vars = ['x', 'y', 'z'].filter(v => expr.includes(v));
    const steps = [
      { label: 'Step 1: 원본 함수', latex: `f(${vars.join(',')}) = ${node.toTex()}` },
      { label: `Step 2: ${variable}에 대해 편미분 (나머지 변수는 상수 취급)`, latex: '' },
    ];
    const deriv = math.derivative(node, variable);
    const simplified = math.simplify(deriv);
    steps[1].latex = `\\frac{\\partial f}{\\partial ${variable}} = ${simplified.toTex()}`;
    steps.push({ label: '결과', latex: simplified.toTex() });
    return { latex: `\\frac{\\partial f}{\\partial ${variable}} = ${simplified.toTex()}`, steps };
  } catch (e) {
    throw new Error('편미분 계산 실패: ' + e.message);
  }
}

export function computeIntegral(expr, variable = 'x', lower = null, upper = null) {
  try {
    const node = math.parse(expr);
    const steps = [{ label: 'Step 1: 피적분함수', latex: node.toTex() }];

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
      steps.push({ label: 'Step 2: Simpson\'s Rule 수치 적분', latex: `\\int_{${lower}}^{${upper}} ${node.toTex()} \\, d${variable}` });
      steps.push({ label: '결과', latex: `= ${math.round(result, 8)}` });
      return {
        latex: `\\int_{${lower}}^{${upper}} ${node.toTex()} \\, d${variable} = ${math.round(result, 8)}`,
        steps,
        value: result
      };
    } else {
      steps.push({ label: 'Step 2: 부정적분 계산', latex: `\\int ${node.toTex()} \\, d${variable}` });
      steps.push({ label: '참고: 수치 적분 엔진 사용 (닫힌 형식 미지원)', latex: `\\int ${node.toTex()} \\, d${variable} + C` });
      return {
        latex: `\\int ${node.toTex()} \\, d${variable} + C`,
        steps,
        note: '수치 적분을 위해 적분 구간을 입력하세요'
      };
    }
  } catch (e) {
    throw new Error('적분 계산 실패: ' + e.message);
  }
}

export function computeLimit(expr, variable = 'x', point = '0', direction = 'both') {
  try {
    const node = math.parse(expr);
    const steps = [{ label: 'Step 1: 원본 함수', latex: node.toTex() }];
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
      steps.push({ label: '결과: 극한 불존재 또는 무한대', latex: `${limitLatex} = \\nexists` });
      return { latex: `${limitLatex} = \\text{존재하지 않음}`, steps };
    }

    steps.push({ label: `Step 2: ${point}${dirLabel} 근방에서 수치 계산`, latex: `${limitLatex} \\approx ${math.round(result, 6)}` });
    return { latex: `${limitLatex} = ${math.round(result, 6)}`, steps, value: result };
  } catch (e) {
    throw new Error('극한 계산 실패: ' + e.message);
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

export function computeTaylor(expr, variable = 'x', point = 0, order = 5) {
  try {
    const p = Number(point);
    const aStr = String(p);
    let derivNode = math.parse(expr);

    const xTermTex = p === 0
      ? `${variable}^n`
      : `(${variable} - ${p})^n`;

    const steps = [
      {
        label: '원본 함수',
        latex: `f(${variable}) = ${derivNode.toTex()}`
      },
      {
        label: `테일러 공식  (전개점 a = ${aStr})`,
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
          label: `n = ${n}  →  0 (항 없음)`,
          latex: n <= 1
            ? `${ftex} = 0`
            : `${ftex} = ${fvStr}, \\quad \\dfrac{${fvStr}}{${n}!} = 0`
        });
      } else {
        const tt = termTex(coeff, n, p, variable);
        steps.push({
          label: `n = ${n}  →  계수 ${coeff}`,
          latex: n <= 1
            ? `${ftex} = ${coeff} \\;\\Longrightarrow\\; ${tt}`
            : `${ftex} = ${fvStr},\\quad \\dfrac{${fvStr}}{${n}!} = ${coeff} \\;\\Longrightarrow\\; ${tt}`
        });
        terms.push({ n, c: coeff });
      }
    }

    if (!terms.length) {
      return { latex: `f(${variable}) \\approx 0`, steps };
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
      label: '테일러 급수',
      latex: `f(${variable}) \\approx ${series}`
    });

    return { latex: `f(${variable}) \\approx ${series}`, steps };
  } catch (e) {
    throw new Error('테일러 급수 계산 실패: ' + e.message);
  }
}
