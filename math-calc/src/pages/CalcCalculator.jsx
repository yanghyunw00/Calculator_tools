import { useState, useMemo, useRef } from 'react';
import * as math from 'mathjs';
import { BlockMath } from '../components/KaTeX';
import StepByStep from '../components/matrix/StepByStep';
import {
  computeDerivative, computePartialDerivative, computeIntegral,
  computeLimit, computeTaylor
} from '../utils/calculusMath';
import { applyFracToResult } from '../utils/fracFormat';

const OPS = [
  { id: 'derivative', label: "f'(x)  도함수" },
  { id: 'partial',    label: '∂/∂x  편미분' },
  { id: 'integral',   label: '∫  적분' },
  { id: 'limit',      label: 'lim  극한' },
  { id: 'taylor',     label: '테일러 급수' },
];

const SYMBOL_GROUPS = [
  { label: '연산', items: [
    { label: 'xⁿ',   insert: '^'     },
    { label: 'x²',   insert: '^2'    },
    { label: 'x³',   insert: '^3'    },
    { label: '√',    insert: 'sqrt(' },
    { label: '÷',    insert: '/'     },
    { label: '( )',  insert: '()'    },
  ]},
  { label: '삼각', items: [
    { label: 'sin',  insert: 'sin('  },
    { label: 'cos',  insert: 'cos('  },
    { label: 'tan',  insert: 'tan('  },
  ]},
  { label: '역삼각', items: [
    { label: 'arcsin', insert: 'asin(' },
    { label: 'arccos', insert: 'acos(' },
    { label: 'arctan', insert: 'atan(' },
  ]},
  { label: '쌍곡', items: [
    { label: 'sinh',  insert: 'sinh(' },
    { label: 'cosh',  insert: 'cosh(' },
    { label: 'tanh',  insert: 'tanh(' },
  ]},
  { label: '로그/지수', items: [
    { label: 'ln',     insert: 'log('    },
    { label: 'log₁₀', insert: 'log10('  },
    { label: 'exp',    insert: 'exp('    },
  ]},
  { label: '상수/기타', items: [
    { label: 'π',   insert: 'pi'   },
    { label: 'e',   insert: 'e'    },
    { label: '|x|', insert: 'abs(' },
  ]},
];

export default function CalcCalculator() {
  const inputRef = useRef(null);
  const [op, setOp] = useState('derivative');
  const [expr, setExpr] = useState('x^3 + 2*x^2 - 5*x + 1');
  const [variable, setVariable] = useState('x');
  const [order, setOrder] = useState(1);
  const [lower, setLower] = useState('0');
  const [upper, setUpper] = useState('1');
  const [limitPoint, setLimitPoint] = useState('0');
  const [limitDir, setLimitDir] = useState('both');
  const [taylorOrder, setTaylorOrder] = useState(5);
  const [taylorPoint, setTaylorPoint] = useState('0');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fracMode, setFracMode] = useState(false);

  const displayResult = useMemo(
    () => fracMode ? applyFracToResult(result) : result,
    [result, fracMode]
  );

  // Live LaTeX preview
  const preview = useMemo(() => {
    if (!expr.trim()) return null;
    try { return math.parse(expr).toTex(); } catch { return null; }
  }, [expr]);

  const insertSymbol = (ins) => {
    const el = inputRef.current;
    if (!el) { setExpr(e => e + ins); return; }
    const start = el.selectionStart ?? expr.length;
    const end   = el.selectionEnd   ?? expr.length;
    const next  = expr.slice(0, start) + ins + expr.slice(end);
    setExpr(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + ins.length, start + ins.length);
    }, 0);
  };

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 60));
    try {
      let res;
      switch (op) {
        case 'derivative': res = computeDerivative(expr, variable, order); break;
        case 'partial':    res = computePartialDerivative(expr, variable); break;
        case 'integral':   res = computeIntegral(expr, variable, lower || null, upper || null); break;
        case 'limit':      res = computeLimit(expr, variable, limitPoint, limitDir); break;
        case 'taylor':     res = computeTaylor(expr, variable, taylorPoint, taylorOrder); break;
        default: throw new Error('연산을 선택하세요');
      }
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>미적분 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>단계별 풀이 포함</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>도함수, 편미분, 정·부정적분, 극한, 테일러 급수를 수식 입력 한 번으로 즉시 계산하고 풀이 과정을 확인할 수 있습니다.</p>
      </div>

      {/* Op tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {OPS.map(o => (
          <button key={o.id} onClick={() => { setOp(o.id); setResult(null); }}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13,
              fontFamily: 'Arial, sans-serif', cursor: 'pointer',
              border: op === o.id ? '1px solid #16a34a' : '1px solid #cccccc',
              background: op === o.id ? '#f0fdf4' : '#ffffff',
              color: op === o.id ? '#16a34a' : '#333333',
              fontWeight: op === o.id ? 600 : 400,
            }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Input card */}
      <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Expression input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>수식 입력</label>
          <input
            ref={inputRef}
            type="text"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') calculate(); }}
            className="calc-input"
            style={{ fontSize: 16, padding: '10px 14px', letterSpacing: '0.02em' }}
            placeholder="예: x^3 + 2*x^2 - 5*x + 1"
          />
          <p style={{ margin: 0, fontSize: 11, color: '#aaaaaa' }}>
            곱셈 <code>*</code> &nbsp;·&nbsp; 거듭제곱 <code>^</code> &nbsp;·&nbsp; 예: <code>2*x^2 + sin(x)</code> &nbsp;·&nbsp; <code>asin(x)</code> = arcsin(x)
          </p>
        </div>

        {/* Live preview */}
        {preview && (
          <div style={{ padding: '2px 14px', background: '#f8fdf8', border: '1px solid #d1fae5', borderRadius: 6, overflowX: 'auto' }}>
            <BlockMath math={preview} />
          </div>
        )}

        {/* Symbol palette */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {SYMBOL_GROUPS.map(group => (
            <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#bbbbbb', minWidth: 52, textAlign: 'right', flexShrink: 0, letterSpacing: '0.03em', fontFamily: 'Arial, sans-serif' }}>
                {group.label}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {group.items.map(item => (
                  <button
                    key={item.label}
                    onClick={() => insertSymbol(item.insert)}
                    style={{
                      padding: '5px 11px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace',
                      border: '1px solid #d8d8d8', background: '#fafafa', color: '#333333',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#86efac'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.borderColor = '#d8d8d8'; }}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Options row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: '#888888' }}>변수</label>
            <select value={variable} onChange={e => setVariable(e.target.value)}
              className="calc-input" style={{ width: 70, textAlign: 'center' }}>
              {['x', 'y', 'z', 't'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {op === 'derivative' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: '#888888' }}>미분 차수</label>
              <input type="number" min={1} max={5} value={order}
                onChange={e => setOrder(Number(e.target.value))}
                className="calc-input" style={{ width: 70, textAlign: 'center' }} />
            </div>
          )}

          {op === 'integral' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>하한</label>
                <input type="text" value={lower} onChange={e => setLower(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} placeholder="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>상한</label>
                <input type="text" value={upper} onChange={e => setUpper(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} placeholder="1" />
              </div>
            </>
          )}

          {op === 'limit' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>극한 값</label>
                <input type="text" value={limitPoint} onChange={e => setLimitPoint(e.target.value)}
                  className="calc-input" style={{ width: 90, textAlign: 'center' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>방향</label>
                <select value={limitDir} onChange={e => setLimitDir(e.target.value)}
                  className="calc-input" style={{ width: 130 }}>
                  <option value="both">양방향</option>
                  <option value="left">좌극한 (x→a⁻)</option>
                  <option value="right">우극한 (x→a⁺)</option>
                </select>
              </div>
            </>
          )}

          {op === 'taylor' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>전개 점</label>
                <input type="text" value={taylorPoint} onChange={e => setTaylorPoint(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>항 수</label>
                <input type="number" min={1} max={10} value={taylorOrder}
                  onChange={e => setTaylorOrder(Number(e.target.value))}
                  className="calc-input" style={{ width: 70, textAlign: 'center' }} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Calculate */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={calculate} disabled={loading} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 40px', fontSize: 14 }}>
          {loading ? <><span className="spinner" /> 계산 중...</> : '계산하기'}
        </button>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {displayResult && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>결과</span>
            <button onClick={() => setFracMode(v => !v)} style={{
              padding: '3px 11px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              border: fracMode ? '1px solid #16a34a' : '1px solid #cccccc',
              background: fracMode ? '#f0fdf4' : '#ffffff',
              color: fracMode ? '#16a34a' : '#888888',
            }}>
              {fracMode ? '분수 ✓' : '분수'}
            </button>
          </div>
          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
            <BlockMath math={displayResult.latex} />
          </div>
          {displayResult.note && <p style={{ fontSize: 12, color: '#888888', margin: 0 }}>{displayResult.note}</p>}
          <StepByStep steps={displayResult.steps} />
        </div>
      )}
    </div>
  );
}
