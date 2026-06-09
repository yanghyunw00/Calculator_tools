import { useState } from 'react';
import { BlockMath } from '../KaTeX';

export default function StepByStep({ steps = [] }) {
  const [open, setOpen] = useState(false);

  if (!steps.length) return null;

  return (
    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 12, marginTop: 4 }}>
      <button onClick={() => setOpen(o => !o)} className="btn-secondary"
        style={{ fontSize: 13 }}>
        {open ? '▲ 단계별 풀이 접기' : '▼ 단계별 풀이 보기'}
      </button>

      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map((step, i) => (
            <div key={i}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', marginBottom: 4 }}>
                {step.label}
              </div>
              {step.latex && (
                <div style={{ background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', overflowX: 'auto' }}>
                  <BlockMath math={step.latex} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
