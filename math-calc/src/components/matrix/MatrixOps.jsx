const singleOps = [
  { id: 'det', label: '행렬식' },
  { id: 'inv', label: '역행렬' },
  { id: 'transpose', label: '전치' },
  { id: 'rank', label: '계수(rank)' },
  { id: 'power', label: '거듭제곱 Aⁿ' },
  { id: 'lu', label: 'LU 분해' },
  { id: 'eigen', label: '고유값/벡터' },
  { id: 'svd', label: 'SVD' },
];

const dualOps = [
  { id: 'multiply', label: 'A × B' },
  { id: 'add', label: 'A + B' },
  { id: 'subtract', label: 'A − B' },
];

export default function MatrixOps({ activeOp, onSelect, mode = 'single' }) {
  const ops = mode === 'single' ? singleOps : dualOps;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {ops.map(op => (
        <button key={op.id} onClick={() => onSelect(op.id)}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            fontSize: 13,
            fontFamily: 'Arial, sans-serif',
            cursor: 'pointer',
            border: activeOp === op.id ? '1px solid #2563eb' : '1px solid #cccccc',
            background: activeOp === op.id ? '#eff6ff' : '#ffffff',
            color: activeOp === op.id ? '#2563eb' : '#333333',
            fontWeight: activeOp === op.id ? 600 : 400,
          }}>
          {op.label}
        </button>
      ))}
    </div>
  );
}
