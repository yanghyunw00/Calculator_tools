import { useState } from 'react';

export default function MatrixGrid({ label, grid, onChange }) {
  const rows = grid.length;
  const cols = grid[0].length;

  const updateCell = (r, c, val) => {
    const next = grid.map(row => [...row]);
    next[r][c] = val;
    onChange(next);
  };

  const addRow = () => {
    if (rows >= 8) return;
    onChange([...grid, Array(cols).fill('')]);
  };
  const removeRow = () => {
    if (rows <= 1) return;
    onChange(grid.slice(0, -1));
  };
  const addCol = () => {
    if (cols >= 8) return;
    onChange(grid.map(row => [...row, '']));
  };
  const removeCol = () => {
    if (cols <= 1) return;
    onChange(grid.map(row => row.slice(0, -1)));
  };

  const fillIdentity = () => {
    const n = Math.min(rows, cols);
    onChange(grid.map((row, r) => row.map((_, c) => r === c && r < n ? '1' : '0')));
  };

  const fillRandom = () => {
    onChange(grid.map(row => row.map(() => String(Math.floor(Math.random() * 9) - 4))));
  };

  const cellSize = cols <= 4 ? 60 : cols <= 6 ? 52 : 44;

  return (
    <div className="calc-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold text-lg gradient-text" style={{ fontFamily: 'JetBrains Mono,monospace' }}>
          {label}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs" style={{ color: '#64748b' }}>{rows}×{cols}</span>
          <button onClick={fillRandom} className="btn-secondary text-xs px-3 py-1">Random</button>
          <button onClick={fillIdentity} className="btn-secondary text-xs px-3 py-1">Identity</button>
        </div>
      </div>

      {/* Row controls */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1 mt-1">
          <button onClick={addRow} disabled={rows >= 8}
            className="btn-secondary w-7 h-7 flex items-center justify-center text-sm font-bold"
            style={{ borderRadius: '6px' }}>+</button>
          <button onClick={removeRow} disabled={rows <= 1}
            className="btn-secondary w-7 h-7 flex items-center justify-center text-sm font-bold"
            style={{ borderRadius: '6px' }}>-</button>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex flex-col gap-1" style={{ display: 'inline-flex' }}>
            {grid.map((row, r) => (
              <div key={r} className="flex gap-1">
                {row.map((cell, c) => (
                  <input
                    key={c}
                    type="text"
                    value={cell}
                    onChange={e => updateCell(r, c, e.target.value)}
                    className="matrix-cell"
                    style={{ width: cellSize, height: 36, fontSize: 14 }}
                    placeholder="0"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Col controls */}
      <div className="flex items-center gap-2 pl-9">
        <button onClick={addCol} disabled={cols >= 8}
          className="btn-secondary w-7 h-7 flex items-center justify-center text-sm font-bold"
          style={{ borderRadius: '6px' }}>+</button>
        <button onClick={removeCol} disabled={cols <= 1}
          className="btn-secondary w-7 h-7 flex items-center justify-center text-sm font-bold"
          style={{ borderRadius: '6px' }}>-</button>
        <span className="text-xs" style={{ color: '#64748b' }}>열 추가/삭제</span>
      </div>
    </div>
  );
}
