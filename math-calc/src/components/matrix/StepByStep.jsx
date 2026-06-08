import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

export default function StepByStep({ steps = [], result = null }) {
  const [open, setOpen] = useState(false);

  if (!steps.length && !result) return null;

  return (
    <div className="calc-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: '#94a3b8', fontFamily: 'Sora,sans-serif' }}>
          단계별 풀이
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
        >
          {open ? '▲ 접기' : '▼ 펼치기'}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 pt-2" style={{ borderTop: '1px solid #1e2d4a' }}>
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-xs font-medium px-2 py-1 rounded"
                style={{ color: '#00d4ff', background: 'rgba(0,212,255,0.06)', fontFamily: 'Sora,sans-serif' }}>
                {step.label}
              </div>
              {step.latex && (
                <div className="px-3 py-2 rounded-lg overflow-x-auto"
                  style={{ background: '#080c18' }}>
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
