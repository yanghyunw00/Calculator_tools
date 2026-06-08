export default function MatrixGrid({ label, grid, onChange }) {
  const rows = grid.length;
  const cols = grid[0].length;

  const updateCell = (r, c, val) => {
    const next = grid.map(row => [...row]);
    next[r][c] = val;
    onChange(next);
  };

  const addRow = () => { if (rows < 8) onChange([...grid, Array(cols).fill('')]); };
  const removeRow = () => { if (rows > 1) onChange(grid.slice(0, -1)); };
  const addCol = () => { if (cols < 8) onChange(grid.map(row => [...row, ''])); };
  const removeCol = () => { if (cols > 1) onChange(grid.map(row => row.slice(0, -1))); };
  const fillIdentity = () => onChange(grid.map((row, r) => row.map((_, c) => r === c ? '1' : '0')));
  const fillRandom = () => onChange(grid.map(row => row.map(() => String(Math.floor(Math.random() * 9) - 4))));
  const fillZero = () => onChange(grid.map(row => row.map(() => '0')));

  const cellW = cols <= 4 ? 58 : cols <= 6 ? 50 : 42;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111111' }}>{label}</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button onClick={fillRandom} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>랜덤</button>
          <button onClick={fillIdentity} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>단위행렬</button>
          <button onClick={fillZero} className="btn-secondary" style={{ fontSize: 12, padding: '4px 10px' }}>초기화</button>
        </div>
      </div>

      {/* Size info */}
      <span style={{ fontSize: 12, color: '#888888' }}>{rows}×{cols}</span>

      {/* Grid with row controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {/* Row +/- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 2 }}>
          <button onClick={addRow} disabled={rows >= 8} className="btn-secondary"
            style={{ width: 26, height: 26, padding: 0, textAlign: 'center', fontSize: 16, lineHeight: 1 }}>+</button>
          <button onClick={removeRow} disabled={rows <= 1} className="btn-secondary"
            style={{ width: 26, height: 26, padding: 0, textAlign: 'center', fontSize: 16, lineHeight: 1 }}>−</button>
        </div>

        {/* Grid */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
            {grid.map((row, r) => (
              <div key={r} style={{ display: 'flex', gap: 4 }}>
                {row.map((cell, c) => (
                  <input key={c} type="text" value={cell}
                    onChange={e => updateCell(r, c, e.target.value)}
                    className="matrix-cell"
                    style={{ width: cellW, height: 34 }}
                    placeholder="0" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Col +/- */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', paddingLeft: 34 }}>
        <button onClick={addCol} disabled={cols >= 8} className="btn-secondary"
          style={{ width: 26, height: 26, padding: 0, textAlign: 'center', fontSize: 16, lineHeight: 1 }}>+</button>
        <button onClick={removeCol} disabled={cols <= 1} className="btn-secondary"
          style={{ width: 26, height: 26, padding: 0, textAlign: 'center', fontSize: 16, lineHeight: 1 }}>−</button>
        <span style={{ fontSize: 12, color: '#888888' }}>열</span>
      </div>
    </div>
  );
}
