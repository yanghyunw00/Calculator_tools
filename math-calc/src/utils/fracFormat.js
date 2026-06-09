function gcd(a, b) {
  a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

// Returns LaTeX fraction string for x, or null if no nice fraction found
function bestFrac(x, maxDenom = 50, tol = 1e-4) {
  if (!isFinite(x) || isNaN(x)) return null;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  if (ax < tol) return '0';
  for (let d = 1; d <= maxDenom; d++) {
    const n = Math.round(ax * d);
    if (n === 0) continue;
    if (Math.abs(n / d - ax) < tol) {
      const g = gcd(n, d);
      const rn = n / g, rd = d / g;
      if (rd > maxDenom) continue;
      if (rd === 1) return sign < 0 ? `-${rn}` : `${rn}`;
      return sign < 0 ? `-\\frac{${rn}}{${rd}}` : `\\frac{${rn}}{${rd}}`;
    }
  }
  return null;
}

// Replace decimals in a LaTeX string with fraction notation
export function applyFracMode(latex) {
  if (!latex) return latex;
  return latex.replace(/-?\d+\.\d+/g, match => {
    const num = parseFloat(match);
    return bestFrac(num) ?? match;
  });
}

// Apply fraction mode to a full result object
export function applyFracToResult(res) {
  if (!res) return res;
  const ap = s => (s ? applyFracMode(s) : s);
  return {
    ...res,
    latex:       ap(res.latex),
    U_latex:     ap(res.U_latex),
    Sigma_latex: ap(res.Sigma_latex),
    VT_latex:    ap(res.VT_latex),
    steps: res.steps?.map(s => ({ ...s, latex: ap(s.latex) })),
  };
}
