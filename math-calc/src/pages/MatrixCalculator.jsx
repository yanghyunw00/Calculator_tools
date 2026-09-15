import { useState, useMemo, useEffect, useRef } from 'react';
import { BlockMath } from '../components/KaTeX';
import MatrixGrid from '../components/matrix/MatrixGrid';
import MatrixOps from '../components/matrix/MatrixOps';
import StepByStep from '../components/matrix/StepByStep';
import {
  parseMatrix, calcDeterminant, calcInverse, calcTranspose, calcRank,
  calcPower, calcLU, calcEigen, calcSVD,
  calcMultiplyChain, calcAddChain, calcSubtractChain,
} from '../utils/matrixMath';
import { applyFracToResult } from '../utils/fracFormat';
import { useLang } from '../i18n/useLang';

const LABELS = ['A', 'B', 'C', 'D'];
const emptyGrid = (r, c) => Array.from({ length: r }, () => Array(c).fill(''));

const FracToggle = ({ active, onClick, t }) => (
  <button onClick={onClick} style={{
    padding: '3px 11px', borderRadius: 5, fontSize: 11, cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
    border: active ? '1px solid #16a34a' : '1px solid #cccccc',
    background: active ? '#f0fdf4' : '#ffffff',
    color: active ? '#16a34a' : '#888888',
  }}>
    {active ? t('common.fracOn') : t('common.frac')}
  </button>
);

export default function MatrixCalculator() {
  const { t, lang } = useLang();

  useEffect(() => {
    document.title = t('matrix.doc.title');
  }, [t]);

  const [mode, setMode] = useState('single');
  const [gridA, setGridA] = useState(emptyGrid(3, 3));
  const [grids, setGrids] = useState([
    emptyGrid(3, 3), emptyGrid(3, 3), emptyGrid(3, 3), emptyGrid(3, 3),
  ]);
  const [matrixCount, setMatrixCount] = useState(2);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
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

  const updateGrid = (i, g) => {
    const next = [...grids];
    next[i] = g;
    setGrids(next);
    setResult(null);
  };

  const changeCount = (delta) => {
    setMatrixCount(c => Math.max(2, Math.min(4, c + delta)));
    setResult(null);
  };

  const handleDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const next = [...grids];
    [next[dragIdx], next[toIdx]] = [next[toIdx], next[dragIdx]];
    setGrids(next);
    setDragIdx(null);
    setDragOver(null);
    setResult(null);
  };

  const calculate = async () => {
    setLoading(true); setError(''); setResult(null);
    await new Promise(r => setTimeout(r, 60));
    try {
      let res;
      if (mode === 'single') {
        const A = parseMatrix(gridA);
        switch (op) {
          case 'det':       res = calcDeterminant(A, t); break;
          case 'inv':       res = calcInverse(A, t); break;
          case 'transpose': res = calcTranspose(A, t); break;
          case 'rank':      res = calcRank(A, t); break;
          case 'power':     res = calcPower(A, power, t); break;
          case 'lu':        res = calcLU(A, t); break;
          case 'eigen':     res = calcEigen(A, t); break;
          case 'svd':       res = calcSVD(A, t); break;
          default: throw new Error(t('common.selectOp'));
        }
      } else {
        const matrices = grids.slice(0, matrixCount).map(g => parseMatrix(g));
        switch (op) {
          case 'multiply': res = calcMultiplyChain(matrices, t); break;
          case 'add':      res = calcAddChain(matrices, t); break;
          case 'subtract': res = calcSubtractChain(matrices, t); break;
          default: throw new Error(t('common.selectOp'));
        }
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>{t('matrix.heading')}</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>{t('common.withSteps')}</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>{t('matrix.intro')}</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[['single', t('matrix.mode.single')], ['multi', t('matrix.mode.multi')]].map(([m, label]) => (
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

      {mode === 'single' ? (
        <div className="calc-card" style={{ padding: 16 }}>
          <MatrixGrid label={t('matrix.matrixLabel', { name: 'A' })} grid={gridA} onChange={g => { setGridA(g); setResult(null); }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Matrix count control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>{t('matrix.count')}</span>
            <button onClick={() => changeCount(-1)} disabled={matrixCount <= 2}
              style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid #ccc', background: '#fff', cursor: matrixCount <= 2 ? 'not-allowed' : 'pointer', fontSize: 16, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              −
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{matrixCount}</span>
            <button onClick={() => changeCount(1)} disabled={matrixCount >= 4}
              style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid #ccc', background: '#fff', cursor: matrixCount >= 4 ? 'not-allowed' : 'pointer', fontSize: 16, color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </button>
            <span style={{ fontSize: 12, color: '#aaa' }}>({LABELS.slice(0, matrixCount).join(', ')})</span>
          </div>

          {/* Matrix grids */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
            {Array.from({ length: matrixCount }, (_, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(i)}
                onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                className="calc-card"
                style={{
                  padding: 14, flex: '1 1 260px', cursor: 'grab',
                  outline: dragOver === i && dragIdx !== i ? '2px dashed #16a34a' : 'none',
                  opacity: dragIdx === i ? 0.5 : 1,
                  transition: 'opacity 0.15s, outline 0.1s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#ccc', cursor: 'grab', userSelect: 'none' }}>⠿</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>{t('matrix.dragHint')}</span>
                </div>
                <MatrixGrid label={t('matrix.matrixLabel', { name: LABELS[i] })} grid={grids[i]} onChange={g => updateGrid(i, g)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations */}
      <div className="calc-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#444444' }}>{t('matrix.selectOp')}</span>
        <MatrixOps activeOp={op} onSelect={o => { setOp(o); setResult(null); }} mode={mode} matrixCount={matrixCount} />
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
          {loading ? <><span className="spinner" /> {t('common.calculating')}</> : t('common.calculate')}
        </button>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {/* Content section */}
      <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>행렬 연산이란?</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#555', lineHeight: 1.8 }}>
          행렬(Matrix)은 수를 직사각형 형태로 배열한 구조로, 선형대수학의 핵심 개념입니다.
          <strong> 행렬식(Determinant)</strong>은 정방행렬에서 스칼라 값을 계산하며, 역행렬 존재 여부 판별과 선형 변환의 부피 비율을 나타냅니다.
          <strong> 역행렬(Inverse)</strong>은 A·A⁻¹ = I를 만족하는 행렬로, 연립방정식 풀이에 활용됩니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { title: 'LU 분해', desc: '행렬을 하삼각행렬(L)과 상삼각행렬(U)로 분해합니다. 연립방정식을 효율적으로 풀 때 사용합니다.' },
            { title: 'SVD (특잇값 분해)', desc: '임의의 행렬을 U·Σ·Vᵀ로 분해합니다. 데이터 압축, 머신러닝 추천 시스템에 핵심적으로 활용됩니다.' },
            { title: '고유값/고유벡터', desc: 'Av = λv를 만족하는 λ(고유값)와 v(고유벡터)를 구합니다. PCA 및 안정성 분석에 사용됩니다.' },
            { title: '랭크(Rank)', desc: '행렬의 선형독립 행(열)의 최대 수입니다. 연립방정식의 해 존재 여부를 결정합니다.' },
          ].map(({ title, desc }) => (
            <div key={title} style={{ padding: '10px 12px', borderRadius: 6, background: '#f9f9f9', border: '1px solid #eee' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.7 }}>
          행렬 곱셈(A×B×C 체인), 덧셈, 뺄셈도 지원하며 최대 4개 행렬까지 한번에 연산할 수 있습니다. 드래그로 행렬 순서를 바꿀 수 있어 비가환적인 행렬 곱의 순서를 쉽게 실험해볼 수 있습니다.
        </p>
      </div>

      {displayResult && (
        <div className="calc-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{t('common.result')}</span>
            <FracToggle active={fracMode} onClick={() => setFracMode(v => !v)} t={t} />
          </div>
          <div style={{ overflowX: 'auto', textAlign: 'center' }}>
            <BlockMath math={displayResult.latex} />
          </div>
          {displayResult.U_latex && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', paddingTop: 8 }}>
              {[
                { label: t('matrix.svd.U'), key: 'U_latex' },
                { label: t('matrix.svd.Sigma'), key: 'Sigma_latex' },
                { label: t('matrix.svd.VT'), key: 'VT_latex' },
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
