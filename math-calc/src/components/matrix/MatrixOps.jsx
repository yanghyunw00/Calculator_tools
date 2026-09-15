import { useLang } from '../../i18n/useLang';

const LABELS = ['A', 'B', 'C', 'D'];

const singleOps = [
  { id: 'det', key: 'op.det' },
  { id: 'inv', key: 'op.inv' },
  { id: 'transpose', key: 'op.transpose' },
  { id: 'rank', key: 'op.rank' },
  { id: 'power', key: 'op.power' },
  { id: 'lu', key: 'op.lu' },
  { id: 'eigen', key: 'op.eigen' },
  { id: 'svd', key: 'op.svd' },
];

export default function MatrixOps({ activeOp, onSelect, mode = 'single', matrixCount = 2 }) {
  const { t } = useLang();
  const ops = mode === 'single'
    ? singleOps.map(o => ({ id: o.id, label: t(o.key) }))
    : [
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
