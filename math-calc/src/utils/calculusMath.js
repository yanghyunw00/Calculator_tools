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

export function computeTaylor(expr, variable = 'x', point = 0, order = 5) {
  try {
    const p = Number(point);
    let node = math.parse(expr);
    const steps = [{ label: 'Step 1: 원본 함수', latex: node.toTex() }];
    const scope = { [variable]: p };
    let terms = [];
    let factorial = 1;

    for (let n = 0; n <= order; n++) {
      if (n > 0) {
        node = math.derivative(node, variable);
        factorial *= n;
      }
      let coeff;
      try { coeff = math.evaluate(node.toString(), scope); } catch { coeff = 0; }
      if (Math.abs(coeff) > 1e-12) {
        const c = math.round(coeff / factorial, 6);
        terms.push({ n, c });
        steps.push({
          label: `Step ${n + 2}: f^(${n})(${p}) / ${n}! = ${math.round(coeff, 6)} / ${factorial} = ${c}`,
          latex: `${c} \\cdot (${variable} ${p >= 0 && n > 0 ? '-' : '+'} ${Math.abs(p)})^{${n}}`
        });
      }
    }

    const seriesLatex = terms.map(({ n, c }) => {
      if (n === 0) return `${c}`;
      if (p === 0) return `${c === 1 ? '' : c === -1 ? '-' : c}${variable}${n > 1 ? `^{${n}}` : ''}`;
      return `${c}(${variable} - ${p})^{${n}}`;
    }).join(' + ').replace(/\+ -/g, '- ');

    steps.push({ label: '결과: 테일러 급수', latex: seriesLatex + ` + O(${variable}^{${order + 1}})` });
    return { latex: seriesLatex + ` + O(${variable}^{${order + 1}})`, steps };
  } catch (e) {
    throw new Error('테일러 급수 계산 실패: ' + e.message);
  }
}
