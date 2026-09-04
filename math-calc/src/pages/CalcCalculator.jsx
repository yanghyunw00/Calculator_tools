import { useState, useMemo, useRef, useEffect } from 'react';
import * as math from 'mathjs';
import { BlockMath } from '../components/KaTeX';
import StepByStep from '../components/matrix/StepByStep';
import {
  computeDerivative, computePartialDerivative, computeIntegral,
  computeLimit, computeTaylor
} from '../utils/calculusMath';
import { applyFracToResult } from '../utils/fracFormat';
import CalcGraph2D from '../components/calculus/CalcGraph2D';
import CalcGraph3D from '../components/calculus/CalcGraph3D';
import { useLang } from '../i18n/useLang';

const OPS = [
  { id: 'derivative', key: 'calc.op.derivative' },
  { id: 'partial',    key: 'calc.op.partial' },
  { id: 'integral',   key: 'calc.op.integral' },
  { id: 'limit',      key: 'calc.op.limit' },
  { id: 'taylor',     key: 'calc.op.taylor' },
];

const SYMBOL_GROUPS = [
  { key: 'calc.symgroup.op', items: [
    { label: 'xⁿ',   insert: '^'     },
    { label: 'x²',   insert: '^2'    },
    { label: 'x³',   insert: '^3'    },
    { label: '√',    insert: 'sqrt(' },
    { label: '÷',    insert: '/'     },
    { label: '( )',  insert: '()'    },
  ]},
  { key: 'calc.symgroup.trig', items: [
    { label: 'sin',  insert: 'sin('  },
    { label: 'cos',  insert: 'cos('  },
    { label: 'tan',  insert: 'tan('  },
  ]},
  { key: 'calc.symgroup.invtrig', items: [
    { label: 'arcsin', insert: 'asin(' },
    { label: 'arccos', insert: 'acos(' },
    { label: 'arctan', insert: 'atan(' },
  ]},
  { key: 'calc.symgroup.hyp', items: [
    { label: 'sinh',  insert: 'sinh(' },
    { label: 'cosh',  insert: 'cosh(' },
    { label: 'tanh',  insert: 'tanh(' },
  ]},
  { key: 'calc.symgroup.logexp', items: [
    { label: 'ln',     insert: 'log('    },
    { label: 'log₁₀', insert: 'log10('  },
    { label: 'exp',    insert: 'exp('    },
  ]},
  { key: 'calc.symgroup.const', items: [
    { label: 'π',   insert: 'pi'   },
    { label: 'e',   insert: 'e'    },
    { label: '|x|', insert: 'abs(' },
  ]},
];

export default function CalcCalculator() {
  const { t, lang } = useLang();
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

  useEffect(() => {
    document.title = t('calc.doc.title');
  }, [t]);

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
        case 'derivative': res = computeDerivative(expr, variable, order, t); break;
        case 'partial':    res = computePartialDerivative(expr, variable, t); break;
        case 'integral':   res = computeIntegral(expr, variable, lower || null, upper || null, t); break;
        case 'limit':      res = computeLimit(expr, variable, limitPoint, limitDir, t); break;
        case 'taylor':     res = computeTaylor(expr, variable, taylorPoint, taylorOrder, t); break;
        default: throw new Error(t('common.selectOp'));
      }
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Recompute so step-by-step labels follow a language switch.
  // Guarded by langRef so it only fires on an actual lang change, never in a loop.
  const langRef = useRef(lang);
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result || error) calculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>{t('calc.heading')}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>{t('common.withSteps')}</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>{t('calc.intro')}</p>
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
            {t(o.key)}
          </button>
        ))}
      </div>

      {/* Input card */}
      <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Expression input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>{t('calc.exprInput')}</label>
          <input
            ref={inputRef}
            type="text"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') calculate(); }}
            className="calc-input"
            style={{ fontSize: 16, padding: '10px 14px', letterSpacing: '0.02em' }}
            placeholder={t('calc.exprPlaceholder')}
          />
          <p style={{ margin: 0, fontSize: 11, color: '#aaaaaa' }}>
            {t('calc.hint.mult')} <code>*</code> &nbsp;·&nbsp; {t('calc.hint.pow')} <code>^</code> &nbsp;·&nbsp; {t('calc.hint.eg')} <code>2*x^2 + sin(x)</code> &nbsp;·&nbsp; <code>asin(x)</code> = arcsin(x)
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
            <div key={group.key} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#bbbbbb', minWidth: 52, textAlign: 'right', flexShrink: 0, letterSpacing: '0.03em', fontFamily: 'Arial, sans-serif' }}>
                {t(group.key)}
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
            <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.var')}</label>
            <select value={variable} onChange={e => setVariable(e.target.value)}
              className="calc-input" style={{ width: 70, textAlign: 'center' }}>
              {['x', 'y', 'z', 't'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {op === 'derivative' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.derivOrder')}</label>
              <input type="number" min={1} max={5} value={order}
                onChange={e => setOrder(Number(e.target.value))}
                className="calc-input" style={{ width: 70, textAlign: 'center' }} />
            </div>
          )}

          {op === 'integral' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.lower')}</label>
                <input type="text" value={lower} onChange={e => setLower(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} placeholder="0" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.upper')}</label>
                <input type="text" value={upper} onChange={e => setUpper(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} placeholder="1" />
              </div>
            </>
          )}

          {op === 'limit' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.limitValue')}</label>
                <input type="text" value={limitPoint} onChange={e => setLimitPoint(e.target.value)}
                  className="calc-input" style={{ width: 90, textAlign: 'center' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.direction')}</label>
                <select value={limitDir} onChange={e => setLimitDir(e.target.value)}
                  className="calc-input" style={{ width: 130 }}>
                  <option value="both">{t('calc.dir.both')}</option>
                  <option value="left">{t('calc.dir.left')}</option>
                  <option value="right">{t('calc.dir.right')}</option>
                </select>
              </div>
            </>
          )}

          {op === 'taylor' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.taylorPoint')}</label>
                <input type="text" value={taylorPoint} onChange={e => setTaylorPoint(e.target.value)}
                  className="calc-input" style={{ width: 80, textAlign: 'center' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: '#888888' }}>{t('calc.taylorTerms')}</label>
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
          {loading ? <><span className="spinner" /> {t('common.calculating')}</> : t('common.calculate')}
        </button>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {displayResult && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{t('common.result')}</span>
            <button onClick={() => setFracMode(v => !v)} style={{
              padding: '3px 11px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
              fontFamily: 'Arial, sans-serif',
              border: fracMode ? '1px solid #16a34a' : '1px solid #cccccc',
              background: fracMode ? '#f0fdf4' : '#ffffff',
              color: fracMode ? '#16a34a' : '#888888',
            }}>
              {fracMode ? t('common.fracOn') : t('common.frac')}
            </button>
          </div>
          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
            <BlockMath math={displayResult.latex} />
          </div>
          {displayResult.note && <p style={{ fontSize: 12, color: '#888888', margin: 0 }}>{displayResult.note}</p>}
          <StepByStep steps={displayResult.steps} />
        </div>
      )}

      {displayResult && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>{t('calc.graph')}</span>
          {op === 'partial' ? (
            <CalcGraph3D
              expr={expr}
              varX={variable}
              varY={variable === 'x' ? 'y' : 'x'}
            />
          ) : (
            <CalcGraph2D
              op={op}
              expr={expr}
              variable={variable}
              lower={lower}
              upper={upper}
              limitPoint={limitPoint}
              limitDir={limitDir}
              taylorResult={op === 'taylor' ? (result?.poly || null) : null}
            />
          )}
        </div>
      )}
    </div>
  );
}
