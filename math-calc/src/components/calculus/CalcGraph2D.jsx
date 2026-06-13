import { useEffect, useRef } from 'react';
import * as math from 'mathjs';

function evalAt(expr, varName, val) {
  try {
    const scope = { [varName]: val, pi: Math.PI, e: Math.E };
    const r = math.evaluate(expr, scope);
    if (typeof r !== 'number' || !isFinite(r)) return null;
    return r;
  } catch { return null; }
}

function numericalDeriv(expr, varName, x) {
  const h = 1e-6;
  const f1 = evalAt(expr, varName, x + h);
  const f2 = evalAt(expr, varName, x - h);
  if (f1 === null || f2 === null) return null;
  return (f1 - f2) / (2 * h);
}

export default function CalcGraph2D({ op, expr, variable, lower, upper, limitPoint, limitDir, taylorResult }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // x range
    let xMin = -6, xMax = 6;
    if (op === 'integral') {
      const lo = parseFloat(lower), hi = parseFloat(upper);
      if (isFinite(lo) && isFinite(hi)) {
        const pad = Math.max((hi - lo) * 0.5, 2);
        xMin = lo - pad; xMax = hi + pad;
      }
    } else if (op === 'limit') {
      const lp = parseFloat(limitPoint);
      if (isFinite(lp)) { xMin = lp - 4; xMax = lp + 4; }
    }

    const N = 400;
    const dx = (xMax - xMin) / N;

    // Evaluate curves
    const fVals = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + i * dx;
      fVals.push({ x, y: evalAt(expr, variable, x) });
    }

    let gVals = null;
    if (op === 'derivative') {
      gVals = fVals.map(({ x }) => ({ x, y: numericalDeriv(expr, variable, x) }));
    } else if (op === 'taylor' && taylorResult) {
      // evaluate taylor polynomial
      gVals = fVals.map(({ x }) => ({ x, y: evalAt(taylorResult, variable, x) }));
    }

    // Auto y-range
    const allY = [...fVals, ...(gVals || [])].map(p => p.y).filter(y => y !== null && isFinite(y));
    if (allY.length === 0) return;
    let yMin = Math.min(...allY), yMax = Math.max(...allY);
    const yPad = Math.max((yMax - yMin) * 0.15, 0.5);
    yMin -= yPad; yMax += yPad;

    // coordinate transforms
    const toCanvasX = x => ((x - xMin) / (xMax - xMin)) * w;
    const toCanvasY = y => h - ((y - yMin) / (yMax - yMin)) * h;

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#e8e8e8';
    ctx.lineWidth = 1;
    const xStep = niceStep((xMax - xMin) / 6);
    const yStep = niceStep((yMax - yMin) / 6);
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 1.5;
    const axisY = toCanvasY(0);
    const axisX = toCanvasX(0);
    if (axisY >= 0 && axisY <= h) {
      ctx.beginPath(); ctx.moveTo(0, axisY); ctx.lineTo(w, axisY); ctx.stroke();
    }
    if (axisX >= 0 && axisX <= w) {
      ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, h); ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = '#aaa';
    ctx.font = `${10 * window.devicePixelRatio / window.devicePixelRatio}px Arial`;
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue;
      const cx = toCanvasX(x);
      const labelY = Math.min(h - 4, Math.max(14, axisY + 14));
      ctx.fillText(fmt(x), cx, labelY);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue;
      const cy = toCanvasY(y);
      const labelX = Math.max(28, Math.min(w - 4, axisX - 4));
      ctx.fillText(fmt(y), labelX, cy + 4);
    }

    // Integral shading
    if (op === 'integral') {
      const lo = parseFloat(lower), hi = parseFloat(upper);
      if (isFinite(lo) && isFinite(hi)) {
        ctx.fillStyle = 'rgba(22, 163, 74, 0.15)';
        ctx.beginPath();
        let started = false;
        const y0 = toCanvasY(0);
        for (let i = 0; i <= N; i++) {
          const { x, y } = fVals[i];
          if (x < lo || x > hi || y === null) continue;
          const cx = toCanvasX(x), cy = toCanvasY(y);
          if (!started) { ctx.moveTo(cx, y0); ctx.lineTo(cx, cy); started = true; }
          else ctx.lineTo(cx, cy);
        }
        if (started) {
          ctx.lineTo(toCanvasX(hi), y0);
          ctx.closePath();
          ctx.fill();
        }
        // bound lines
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        [lo, hi].forEach(bx => {
          const cx = toCanvasX(bx);
          ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
        });
        ctx.setLineDash([]);
      }
    }

    // Limit vertical line
    if (op === 'limit') {
      const lp = parseFloat(limitPoint);
      if (isFinite(lp)) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        const cx = toCanvasX(lp);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
        ctx.setLineDash([]);
        // open dot at limit
        const yAtLimit = evalAt(expr, variable, lp + 1e-8);
        if (yAtLimit !== null) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(toCanvasX(lp), toCanvasY(yAtLimit), 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Draw curve helper
    const drawCurve = (vals, color, width = 2) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i < vals.length; i++) {
        const { x, y } = vals[i];
        if (y === null || !isFinite(y) || y < yMin - 1 || y > yMax + 1) { pen = false; continue; }
        const cx = toCanvasX(x), cy = toCanvasY(y);
        if (!pen) { ctx.moveTo(cx, cy); pen = true; } else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    };

    // f(x) curve
    drawCurve(fVals, '#2563eb', 2);

    // secondary curve
    if (gVals) {
      drawCurve(gVals, op === 'taylor' ? '#dc2626' : '#16a34a', 2);
    }

    // Legend
    const legends = [{ color: '#2563eb', label: `f(${variable})` }];
    if (op === 'derivative') legends.push({ color: '#16a34a', label: `f'(${variable})` });
    if (op === 'taylor') legends.push({ color: '#dc2626', label: '테일러 근사' });
    if (op === 'integral') legends.push({ color: '#16a34a', label: `∫ [${lower}, ${upper}]` });
    if (op === 'limit') legends.push({ color: '#f59e0b', label: `x → ${limitPoint}` });

    legends.forEach(({ color, label }, i) => {
      const lx = 10, ly = 14 + i * 18;
      ctx.fillStyle = color;
      ctx.fillRect(lx, ly - 7, 18, 3);
      ctx.fillStyle = '#444';
      ctx.textAlign = 'left';
      ctx.font = '11px Arial';
      ctx.fillText(label, lx + 22, ly);
    });
  }, [op, expr, variable, lower, upper, limitPoint, taylorResult]);

  return (
    <div style={{ width: '100%', height: 280, borderRadius: 8, overflow: 'hidden', background: '#fafafa' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

function niceStep(rough) {
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / mag;
  if (frac < 1.5) return mag;
  if (frac < 3.5) return 2 * mag;
  if (frac < 7.5) return 5 * mag;
  return 10 * mag;
}

function fmt(n) {
  if (Math.abs(n) >= 100) return Math.round(n).toString();
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(1)).toString();
}
