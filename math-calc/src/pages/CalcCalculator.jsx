import { useState } from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import StepByStep from '../components/matrix/StepByStep';
import {
  computeDerivative, computePartialDerivative, computeIntegral,
  computeLimit, computeTaylor
} from '../utils/calculusMath';

const OPS = [
  { id: 'derivative', label: '도함수', icon: "f'(x)" },
  { id: 'partial', label: '편미분', icon: '∂f/∂x' },
  { id: 'integral', label: '적분', icon: '∫f dx' },
  { id: 'limit', label: '극한', icon: 'lim' },
  { id: 'taylor', label: '테일러 급수', icon: 'Σaₙxⁿ' },
];

const SYMBOLS = ['x²', 'x³', '√', 'π', 'e', 'sin', 'cos', 'tan', 'ln', 'log', 'exp', '∞', '^', '(', ')', '/'];
const SYMBOL_MAP = { 'x²': 'x^2', 'x³': 'x^3', '√': 'sqrt(', '∞': 'Infinity' };

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
  const [preview, setPreview] = useState('');

  const insertSymbol = sym => {
    const ins = SYMBOL_MAP[sym] || sym;
    setExpr(e => e + ins);
  };

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 80));
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
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-1" style={{ fontFamily: 'Sora,sans-serif' }}>
          미적분 계산기
        </h1>
        <p className="text-sm" style={{ color: '#64748b', fontFamily: 'Sora,sans-serif' }}>
          도함수, 적분, 극한, 급수 — 단계별 풀이 제공
        </p>
      </div>

      {/* Op tabs */}
      <div className="flex flex-wrap gap-2">
        {OPS.map(o => (
          <button key={o.id} onClick={() => { setOp(o.id); setResult(null); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: 'Sora,sans-serif',
              background: op === o.id ? 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(124,58,237,0.2))' : '#1a2540',
              color: op === o.id ? '#00d4ff' : '#94a3b8',
              border: op === o.id ? '1px solid rgba(0,212,255,0.5)' : '1px solid #2d3a5e',
            }}>
            <span className="mr-1.5" style={{ fontFamily: 'JetBrains Mono,monospace' }}>{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>

      {/* Expression input */}
      <div className="calc-card p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>수식 입력</label>
          <input
            type="text"
            value={expr}
            onChange={e => setExpr(e.target.value)}
            className="calc-input text-lg"
            placeholder="예: x^3 + 2*x^2 - 5*x + 1"
          />
        </div>

        {/* Symbol buttons */}
        <div className="flex flex-wrap gap-1.5">
          {SYMBOLS.map(sym => (
            <button key={sym} onClick={() => insertSymbol(sym)}
              className="btn-secondary px-2.5 py-1 text-sm rounded-lg"
              style={{ fontFamily: 'JetBrains Mono,monospace' }}>
              {sym}
            </button>
          ))}
        </div>

        {/* Options per operation */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: '#64748b' }}>변수</label>
            <select value={variable} onChange={e => setVariable(e.target.value)}
              className="calc-input w-20 text-center text-sm">
              {['x', 'y', 'z', 't'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {op === 'derivative' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: '#64748b' }}>미분 차수</label>
              <input type="number" min={1} max={5} value={order} onChange={e => setOrder(Number(e.target.value))}
                className="calc-input w-20 text-center text-sm" />
            </div>
          )}

          {op === 'integral' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>하한 (선택)</label>
                <input type="text" value={lower} onChange={e => setLower(e.target.value)}
                  className="calc-input w-24 text-center text-sm" placeholder="0" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>상한 (선택)</label>
                <input type="text" value={upper} onChange={e => setUpper(e.target.value)}
                  className="calc-input w-24 text-center text-sm" placeholder="1" />
              </div>
            </>
          )}

          {op === 'limit' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>극한 값</label>
                <input type="text" value={limitPoint} onChange={e => setLimitPoint(e.target.value)}
                  className="calc-input w-28 text-center text-sm" placeholder="0" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>방향</label>
                <select value={limitDir} onChange={e => setLimitDir(e.target.value)}
                  className="calc-input text-sm">
                  <option value="both">양방향</option>
                  <option value="left">좌극한 (x→a⁻)</option>
                  <option value="right">우극한 (x→a⁺)</option>
                </select>
              </div>
            </>
          )}

          {op === 'taylor' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>전개 점</label>
                <input type="text" value={taylorPoint} onChange={e => setTaylorPoint(e.target.value)}
                  className="calc-input w-24 text-center text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: '#64748b' }}>항 수</label>
                <input type="number" min={1} max={10} value={taylorOrder} onChange={e => setTaylorOrder(Number(e.target.value))}
                  className="calc-input w-20 text-center text-sm" />
              </div>
            </>
          )}
        </div>
      </div>

      <button onClick={calculate} disabled={loading}
        className="btn-primary px-8 py-3 text-base font-semibold flex items-center gap-3 self-start">
        {loading ? <><span className="spinner" />계산 중...</> : '계산하기 →'}
      </button>

      {error && (
        <div className="p-4 rounded-xl text-sm flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontFamily: 'Sora,sans-serif' }}>
          <span>⚠</span> {error}
        </div>
      )}

      {result && (
        <>
          <div className="calc-card p-5 flex flex-col gap-3">
            <span className="text-sm font-semibold" style={{ color: '#00d4ff', fontFamily: 'Sora,sans-serif' }}>결과</span>
            <div className="overflow-x-auto">
              <BlockMath math={result.latex} />
            </div>
            {result.note && <p className="text-xs" style={{ color: '#64748b' }}>{result.note}</p>}
          </div>
          <StepByStep steps={result.steps} />
        </>
      )}
    </div>
  );
}
