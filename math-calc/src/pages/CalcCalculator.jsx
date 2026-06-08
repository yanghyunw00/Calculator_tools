import { useState } from 'react';
import { BlockMath } from 'react-katex';
import StepByStep from '../components/matrix/StepByStep';
import {
  computeDerivative, computePartialDerivative, computeIntegral,
  computeLimit, computeTaylor
} from '../utils/calculusMath';

const OPS = [
  { id: 'derivative', label: '도함수' },
  { id: 'partial', label: '편미분' },
  { id: 'integral', label: '적분' },
  { id: 'limit', label: '극한' },
  { id: 'taylor', label: '테일러 급수' },
];

const SYMBOLS = ['x²', 'x³', '√(', 'π', 'e', 'sin(', 'cos(', 'tan(', 'ln(', 'log(', 'exp(', '^', '(', ')', '/'];
const SYMBOL_MAP = { 'x²': 'x^2', 'x³': 'x^3', '√(': 'sqrt(' };

export default function CalcCalculator() {
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

  const insertSymbol = sym => {
    const ins = SYMBOL_MAP[sym] || sym;
    setExpr(e => e + ins);
  };

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 60));
    try {
      let res;
      switch (op) {
        case 'derivative': res = computeDerivative(expr, variable, order); break;
        case 'partial': res = computePartialDerivative(expr, variable); break;
        case 'integral': res = computeIntegral(expr, variable, lower || null, upper || null); break;
        case 'limit': res = computeLimit(expr, variable, limitPoint, limitDir); break;
        case 'taylor': res = computeTaylor(expr, variable, taylorPoint, taylorOrder); break;
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
      <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>수식 입력</label>
          <input type="text" value={expr} onChange={e => setExpr(e.target.value)}
            className="calc-input" style={{ fontSize: 15 }}
            placeholder="예: x^3 + 2*x^2 - 5*x + 1" />
        </div>

        {/* Symbol palette */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {SYMBOLS.map(sym => (
            <button key={sym} onClick={() => insertSymbol(sym)} className="btn-secondary"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, padding: '4px 10px' }}>
              {sym}
            </button>
          ))}
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
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
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 32px', fontSize: 14 }}>
          {loading ? <><span className="spinner" /> 계산 중...</> : '계산하기'}
        </button>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {result && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>결과</span>
          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
            <BlockMath math={result.latex} />
          </div>
          {result.note && <p style={{ fontSize: 12, color: '#888888', margin: 0 }}>{result.note}</p>}
          <StepByStep steps={result.steps} />
        </div>
      )}
    </div>
  );
}
