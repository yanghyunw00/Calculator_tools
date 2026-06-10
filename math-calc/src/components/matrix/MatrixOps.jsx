const LABELS = ['A', 'B', 'C', 'D'];

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

export default function MatrixOps({ activeOp, onSelect, mode = 'single', matrixCount = 2 }) {
  const ops = mode === 'single' ? singleOps : [
    { id: 'multiply', label: LABELS.slice(0, matrixCount).join(' × ') },
    { id: 'add',      label: LABELS.slice(0, matrixCount).join(' + ') },
    { id: 'subtract', label: LABELS.slice(0, matrixCount).join(' − ') },
  ];
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
            border: activeOp === op.id ? '1px solid #16a34a' : '1px solid #cccccc',
            background: activeOp === op.id ? '#f0fdf4' : '#ffffff',
            color: activeOp === op.id ? '#16a34a' : '#333333',
            fontWeight: activeOp === op.id ? 600 : 400,
          }}>
          {op.label}
        </button>
      ))}
    </div>
  );
}
