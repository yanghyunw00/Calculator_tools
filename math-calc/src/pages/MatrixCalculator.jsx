import { useState } from 'react';
import { BlockMath } from 'react-katex';
import MatrixGrid from '../components/matrix/MatrixGrid';
import MatrixOps from '../components/matrix/MatrixOps';
import StepByStep from '../components/matrix/StepByStep';
import {
  parseMatrix, calcDeterminant, calcInverse, calcTranspose, calcRank,
  calcPower, calcLU, calcEigen, calcMultiply, calcAdd, calcSubtract, calcSVD
} from '../utils/matrixMath';

const emptyGrid = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));

export default function MatrixCalculator() {
  const [mode, setMode] = useState('single');
  const [gridA, setGridA] = useState(emptyGrid(3, 3));
  const [gridB, setGridB] = useState(emptyGrid(3, 3));
  const [op, setOp] = useState('det');
  const [power, setPower] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 80));
    try {
      const A = parseMatrix(gridA);
      const B = parseMatrix(gridB);
      let res;
      if (mode === 'single') {
        switch (op) {
          case 'det': res = calcDeterminant(A); break;
          case 'inv': res = calcInverse(A); break;
          case 'transpose': res = calcTranspose(A); break;
          case 'rank': res = calcRank(A); break;
          case 'power': res = calcPower(A, power); break;
          case 'lu': res = calcLU(A); break;
          case 'eigen': res = calcEigen(A); break;
          case 'svd': res = calcSVD(A); break;
          default: throw new Error('연산을 선택하세요');
        }
      } else {
        switch (op) {
          case 'multiply': res = calcMultiply(A, B); break;
          case 'add': res = calcAdd(A, B); break;
          case 'subtract': res = calcSubtract(A, B); break;
          default: throw new Error('연산을 선택하세요');
        }
      }
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-1" style={{ fontFamily: 'Sora,sans-serif' }}>
          행렬 계산기
        </h1>
        <p className="text-sm" style={{ color: '#64748b', fontFamily: 'Sora,sans-serif' }}>
          단계별 풀이와 함께하는 고급 행렬 연산
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        {['single', 'dual'].map(m => (
          <button key={m} onClick={() => { setMode(m); setOp(m === 'single' ? 'det' : 'multiply'); setResult(null); }}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              fontFamily: 'Sora,sans-serif',
              background: mode === m ? 'linear-gradient(135deg,#00d4ff,#7c3aed)' : '#1a2540',
              color: mode === m ? 'white' : '#94a3b8',
              border: mode === m ? 'none' : '1px solid #2d3a5e',
            }}>
            {m === 'single' ? '단일 행렬 연산' : '두 행렬 연산 (A, B)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MatrixGrid label="행렬 A" grid={gridA} onChange={setGridA} />
        {mode === 'dual' && <MatrixGrid label="행렬 B" grid={gridB} onChange={setGridB} />}
      </div>

      {/* Operations */}
      <div className="calc-card p-4 flex flex-col gap-3">
        <span className="text-sm font-semibold" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>연산 선택</span>
        <MatrixOps activeOp={op} onSelect={o => { setOp(o); setResult(null); }} mode={mode} />
        {op === 'power' && mode === 'single' && (
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#94a3b8' }}>n =</span>
            <input type="number" value={power} onChange={e => setPower(Number(e.target.value))}
              className="calc-input w-24 text-center" style={{ fontFamily: 'JetBrains Mono,monospace' }} />
          </div>
        )}
      </div>

      <button onClick={calculate} disabled={loading}
        className="btn-primary px-8 py-3 text-base font-semibold flex items-center justify-center gap-3 self-start">
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
          </div>
          <StepByStep steps={result.steps} />
        </>
      )}
    </div>
  );
}
