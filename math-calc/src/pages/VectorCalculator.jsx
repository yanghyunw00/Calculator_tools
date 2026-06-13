import { useState, useMemo, useEffect } from 'react';
import { BlockMath } from '../components/KaTeX';
import VectorScene from '../components/vector/VectorScene';

function parseVec(inputs) {
  return inputs.map(v => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  });
}

function fmt(n) {
  const r = Math.round(n * 10000) / 10000;
  return Number.isInteger(r) ? String(r) : String(parseFloat(r.toFixed(4)));
}

function vecToLatex(v) {
  return `\\begin{pmatrix} ${v.map(fmt).join(' \\\\ ')} \\end{pmatrix}`;
}

const VecInput = ({ label, color, values, onChange }) => (
  <div className="calc-card" style={{ padding: 16, flex: '1 1 200px' }}>
    <div style={{ fontSize: 13, fontWeight: 700, color, marginBottom: 12 }}>벡터 {label}</div>
    {['x', 'y', 'z'].map((axis, i) => (
      <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#555', minWidth: 14 }}>{axis}</span>
        <input
          type="number"
          value={values[i]}
          onChange={e => {
            const next = [...values];
            next[i] = e.target.value;
            onChange(next);
          }}
          className="calc-input"
          style={{ flex: 1, textAlign: 'center' }}
          placeholder="0"
        />
      </div>
    ))}
  </div>
);

export default function VectorCalculator() {
  useEffect(() => {
    document.title = '벡터 계산기 — 내적·외적·3D 시각화 | MathCalc';
  }, []);

  const [vA, setVA] = useState(['1', '0', '0']);
  const [vB, setVB] = useState(['0', '1', '0']);
  const [op, setOp] = useState('cross');

  const a = useMemo(() => parseVec(vA), [vA]);
  const b = useMemo(() => parseVec(vB), [vB]);

  const result = useMemo(() => {
    if (op === 'dot') {
      const dot = a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
      const magA = Math.sqrt(a[0]**2 + a[1]**2 + a[2]**2);
      const magB = Math.sqrt(b[0]**2 + b[1]**2 + b[2]**2);
      const cosTheta = (magA > 1e-10 && magB > 1e-10) ? dot / (magA * magB) : null;
      const angleDeg = cosTheta !== null ? (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180 / Math.PI) : null;
      return {
        type: 'dot',
        value: dot,
        magA, magB, cosTheta, angleDeg,
        latex: `\\mathbf{a} \\cdot \\mathbf{b} = ${vecToLatex(a)}^T ${vecToLatex(b)} = ${fmt(dot)}`,
        steps: [
          { label: 'Step 1: 벡터', latex: `\\mathbf{a} = ${vecToLatex(a)}, \\quad \\mathbf{b} = ${vecToLatex(b)}` },
          { label: 'Step 2: 내적 공식  a·b = a₁b₁ + a₂b₂ + a₃b₃', latex: `= (${fmt(a[0])})(${fmt(b[0])}) + (${fmt(a[1])})(${fmt(b[1])}) + (${fmt(a[2])})(${fmt(b[2])})` },
          { label: 'Step 3: 결과', latex: `\\mathbf{a} \\cdot \\mathbf{b} = ${fmt(dot)}` },
          ...(angleDeg !== null ? [{ label: 'Step 4: 사잇각  θ = arccos(a·b / |a||b|)', latex: `\\theta = \\arccos\\left(\\frac{${fmt(dot)}}{${fmt(magA)} \\times ${fmt(magB)}}\\right) = ${fmt(angleDeg)}^\\circ` }] : []),
        ],
      };
    } else {
      const cx = a[1]*b[2] - a[2]*b[1];
      const cy = a[2]*b[0] - a[0]*b[2];
      const cz = a[0]*b[1] - a[1]*b[0];
      const cross = [cx, cy, cz];
      const mag = Math.sqrt(cx**2 + cy**2 + cz**2);
      return {
        type: 'cross',
        value: cross,
        mag,
        latex: `\\mathbf{a} \\times \\mathbf{b} = ${vecToLatex(cross)}`,
        steps: [
          { label: 'Step 1: 벡터', latex: `\\mathbf{a} = ${vecToLatex(a)}, \\quad \\mathbf{b} = ${vecToLatex(b)}` },
          { label: 'Step 2: 외적 공식 (행렬식 전개)', latex: `\\mathbf{a} \\times \\mathbf{b} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${fmt(a[0])} & ${fmt(a[1])} & ${fmt(a[2])} \\\\ ${fmt(b[0])} & ${fmt(b[1])} & ${fmt(b[2])} \\end{vmatrix}` },
          { label: 'Step 3: 각 성분 계산', latex: `i: (${fmt(a[1])})(${fmt(b[2])}) - (${fmt(a[2])})(${fmt(b[1])}) = ${fmt(cx)}` },
          { label: '', latex: `j: (${fmt(a[2])})(${fmt(b[0])}) - (${fmt(a[0])})(${fmt(b[2])}) = ${fmt(cy)}` },
          { label: '', latex: `k: (${fmt(a[0])})(${fmt(b[1])}) - (${fmt(a[1])})(${fmt(b[0])}) = ${fmt(cz)}` },
          { label: '결과', latex: `\\mathbf{a} \\times \\mathbf{b} = ${vecToLatex(cross)}, \\quad |\\mathbf{a} \\times \\mathbf{b}| = ${fmt(mag)}` },
        ],
      };
    }
  }, [a, b, op]);

  const crossForScene = result.type === 'cross' ? result.value : null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111111' }}>벡터 계산기</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888888' }}>3D 내적 · 외적 · 실시간 시각화</p>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#aaaaaa', lineHeight: 1.6 }}>두 3D 벡터의 내적(dot product)과 외적(cross product)을 단계별로 계산하고 결과를 3D 공간에서 시각화합니다.</p>
      </div>

      {/* Op toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[['cross', '외적 (A × B)'], ['dot', '내적 (A · B)']].map(([o, label]) => (
          <button key={o} onClick={() => setOp(o)}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: 13,
              fontFamily: 'Arial, sans-serif', cursor: 'pointer',
              border: op === o ? '1px solid #16a34a' : '1px solid #cccccc',
              background: op === o ? '#f0fdf4' : '#ffffff',
              color: op === o ? '#16a34a' : '#333333',
              fontWeight: op === o ? 600 : 400,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Vector inputs */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <VecInput label="A" color="#16a34a" values={vA} onChange={setVA} />
        <VecInput label="B" color="#2563eb" values={vB} onChange={setVB} />

        {/* Info panel */}
        <div className="calc-card" style={{ padding: 16, flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#444', marginBottom: 4 }}>벡터 크기</div>
          {[['A', a, '#16a34a'], ['B', b, '#2563eb']].map(([label, v, color]) => {
            const mag = Math.sqrt(v.reduce((s, x) => s + x*x, 0));
            return (
              <div key={label} style={{ fontSize: 13, color: '#555' }}>
                <span style={{ color, fontWeight: 700 }}>|{label}|</span> = {fmt(mag)}
              </div>
            );
          })}
          {result.type === 'cross' && (
            <div style={{ fontSize: 13, color: '#555', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
              <span style={{ color: '#dc2626', fontWeight: 700 }}>|A×B|</span> = {fmt(result.mag)}
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>(평행사변형 넓이)</div>
            </div>
          )}
          {result.type === 'dot' && result.angleDeg !== null && (
            <div style={{ fontSize: 13, color: '#555', borderTop: '1px solid #eee', paddingTop: 8, marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>θ</span> = {fmt(result.angleDeg)}°
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>(두 벡터의 사잇각)</div>
            </div>
          )}
        </div>
      </div>

      {/* Result latex */}
      <div className="calc-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', marginBottom: 12 }}>결과</div>
        <div style={{ overflowX: 'auto', textAlign: 'center' }}>
          <BlockMath math={result.latex} />
        </div>
        <div style={{ marginTop: 16, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 8 }}>풀이 과정</div>
          {result.steps.map((s, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              {s.label && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{s.label}</div>}
              {s.latex && <div style={{ overflowX: 'auto' }}><BlockMath math={s.latex} /></div>}
            </div>
          ))}
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="calc-card" style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>
          3D 시각화
          <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa', marginLeft: 8 }}>드래그로 회전</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
          {[['A', '#16a34a'], ['B', '#2563eb'], ...(crossForScene ? [['A×B', '#dc2626']] : [])].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#555' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
              벡터 {label}
            </div>
          ))}
        </div>
        <VectorScene vecA={a} vecB={b} crossProduct={crossForScene} />
      </div>
    </div>
  );
}
