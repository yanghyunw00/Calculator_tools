import { useState, useMemo } from 'react';
import { BlockMath } from '../components/KaTeX';
import MatrixGrid from '../components/matrix/MatrixGrid';
import MatrixOps from '../components/matrix/MatrixOps';
import StepByStep from '../components/matrix/StepByStep';
import {
  parseMatrix, calcDeterminant, calcInverse, calcTranspose, calcRank,
  calcPower, calcLU, calcEigen, calcMultiply, calcAdd, calcSubtract, calcSVD
} from '../utils/matrixMath';
import { applyFracToResult } from '../utils/fracFormat';

const emptyGrid = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));

const FracToggle = ({ active, onClick }) => (
  <button onClick={onClick} style={{
    padding: '3px 11px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    border: active ? '1px solid #16a34a' : '1px solid #cccccc',
    background: active ? '#f0fdf4' : '#ffffff',
    color: active ? '#16a34a' : '#888888',
  }}>
    {active ? '분수 ✓' : '분수'}
  </button>
);

export default function MatrixCalculator() {
  const [mode, setMode] = useState('single');
  const [gridA, setGridA] = useState(emptyGrid(3, 3));
  const [gridB, setGridB] = useState(emptyGrid(3, 3));
  const [op, setOp] = useState('det');
  const [power, setPower] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fracMode, setFracMode] = useState(false);

  const displayResult = useMemo(
    () => fracMode ? applyFracToResult(result) : result,
    [result, fracMode]
  );

  const swapAB = () => { setGridA(gridB); setGridB(gridA); setResult(null); };

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 60));
    try {
      const A = parseMatrix(gridA);
      const B = parseMatrix(gridB);
      let res;
      if (mode === 'single') {
        switch (op) {
          case 'det':       res = calcDeterminant(A); break;
          case 'inv':       res = calcInverse(A); break;
          case 'transpose': res = calcTranspose(A); break;
          case 'rank':      res = calcRank(A); break;
          case 'power':     res = calcPower(A, power); break;
          case 'lu':        res = calcLU(A); break;
          case 'eigen':     res = calcEigen(A); break;
          case 'svd':       res = calcSVD(A); break;
          default: throw new Error('연산을 선택하세요');
        }
      } else {
        switch (op) {
          case 'multiply':  res = calcMultiply(A, B); break;
          case 'add':       res = calcAdd(A, B); break;
          case 'subtract':  res = calcSubtract(A, B); break;
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
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>행렬 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>단계별 풀이 포함</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[['single', '단일 행렬 (A)'], ['dual', '두 행렬 (A, B)']].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setOp(m === 'single' ? 'det' : 'multiply'); setResult(null); }}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13,
              fontFamily: 'Arial, sans-serif', cursor: 'pointer',
              border: mode === m ? '1px solid #16a34a' : '1px solid #cccccc',
              background: mode === m ? '#f0fdf4' : '#ffffff',
              color: mode === m ? '#16a34a' : '#333333',
              fontWeight: mode === m ? 600 : 400,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Matrix inputs */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div className="calc-card" style={{ padding: 16, flex: '1 1 300px' }}>
          <MatrixGrid label="행렬 A" grid={gridA} onChange={g => { setGridA(g); setResult(null); }} />
        </div>

        {mode === 'dual' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: 40 }}>
              <button onClick={swapAB} className="btn-secondary"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', fontSize: 18, lineHeight: 1 }}
                title="A ↔ B 교환">
                <span>⇄</span>
                <span style={{ fontSize: 10, color: '#888888' }}>교환</span>
              </button>
            </div>
            <div className="calc-card" style={{ padding: 16, flex: '1 1 300px' }}>
              <MatrixGrid label="행렬 B" grid={gridB} onChange={g => { setGridB(g); setResult(null); }} />
            </div>
          </>
        )}
      </div>

      {/* Operations */}
      <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>연산 선택</span>
        <MatrixOps activeOp={op} onSelect={o => { setOp(o); setResult(null); }} mode={mode} />
        {op === 'power' && mode === 'single' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#444444' }}>n =</span>
            <input type="number" value={power}
              onChange={e => setPower(Number(e.target.value))}
              className="calc-input" style={{ width: 80, textAlign: 'center' }} />
          </div>
        )}
      </div>

      {/* Calculate button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={calculate} disabled={loading} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 32px', fontSize: 14 }}>
          {loading ? <><span className="spinner" /> 계산 중...</> : '계산하기'}
        </button>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {/* Result */}
      {displayResult && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>결과</span>
            <FracToggle active={fracMode} onClick={() => setFracMode(v => !v)} />
          </div>

          {/* Main result */}
          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
            <BlockMath math={displayResult.latex} />
          </div>

          {/* SVD: show U, Σ, V^T as separate panels */}
          {displayResult.U_latex && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', paddingTop: 8 }}>
              {[
                { label: 'U  (좌 특이벡터)', key: 'U_latex' },
                { label: 'Σ  (대각 특이값)', key: 'Sigma_latex' },
                { label: 'Vᵀ  (우 특이벡터)', key: 'VT_latex' },
              ].map(({ label, key }) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#888888', fontFamily: 'Arial, sans-serif' }}>{label}</span>
                  <div style={{ overflowX: 'auto' }}>
                    <BlockMath math={displayResult[key]} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <StepByStep steps={displayResult.steps} />
        </div>
      )}
    </div>
  );
}
