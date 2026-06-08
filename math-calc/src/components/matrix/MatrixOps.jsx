const singleOps = [
  { id: 'det', label: '행렬식 (det)', icon: '|A|' },
  { id: 'inv', label: '역행렬', icon: 'A⁻¹' },
  { id: 'transpose', label: '전치', icon: 'Aᵀ' },
  { id: 'rank', label: '계수 (rank)', icon: 'rank' },
  { id: 'power', label: '거듭제곱', icon: 'Aⁿ' },
  { id: 'lu', label: 'LU 분해', icon: 'LU' },
  { id: 'eigen', label: '고유값/벡터', icon: 'λv' },
  { id: 'svd', label: 'SVD', icon: 'UΣVᵀ' },
];

const dualOps = [
  { id: 'multiply', label: 'A × B', icon: '×' },
  { id: 'add', label: 'A + B', icon: '+' },
  { id: 'subtract', label: 'A - B', icon: '-' },
];

export default function MatrixOps({ activeOp, onSelect, mode = 'single' }) {
  const ops = mode === 'single' ? singleOps : dualOps;
  return (
    <div className="flex flex-wrap gap-2">
      {ops.map(op => (
        <button
          key={op.id}
          onClick={() => onSelect(op.id)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
          style={{
            fontFamily: 'JetBrains Mono,monospace',
            background: activeOp === op.id
              ? 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,58,237,0.15))'
              : '#1a2540',
            border: activeOp === op.id ? '1px solid rgba(0,212,255,0.5)' : '1px solid #2d3a5e',
            color: activeOp === op.id ? '#00d4ff' : '#94a3b8',
            minWidth: 72,
          }}
        >
          <span className="font-bold text-base">{op.icon}</span>
          <span style={{ fontSize: 10 }}>{op.label}</span>
        </button>
      ))}
    </div>
  );
}
