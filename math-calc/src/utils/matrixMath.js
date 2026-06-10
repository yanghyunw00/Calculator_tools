import * as math from 'mathjs';

export function parseMatrix(grid) {
  return grid.map(row =>
    row.map(cell => {
      const val = cell.trim();
      if (!val) return 0;
      try { return math.evaluate(val); } catch { return 0; }
    })
  );
}

export function formatNum(n, decimals = 4) {
  if (typeof n !== 'number' && typeof n !== 'bigint') n = Number(n);
  if (!isFinite(n)) return String(n);
  const rounded = Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
  if (Number.isInteger(rounded)) return String(rounded);
  return String(parseFloat(rounded.toFixed(decimals)));
}

export function matrixToLatex(m, decimals = 4) {
  const rows = m.map(row =>
    row.map(v => formatNum(typeof v === 'object' ? math.re(v) : v, decimals)).join(' & ')
  );
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

export function vectorToLatex(v) {
  return `\\begin{pmatrix} ${v.map(x => formatNum(x)).join(' \\\\ ')} \\end{pmatrix}`;
}

// ── Determinant (Gaussian elimination steps) ──────────────────────────────
export function calcDeterminant(m) {
  const n = m.length;
  const det = math.det(math.matrix(m));
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];

  if (n === 1) {
    steps.push({ label: 'Step 2: 1×1 행렬식', latex: `\\det(A) = ${formatNum(m[0][0])}` });
  } else if (n === 2) {
    steps.push({ label: 'Step 2: 2×2 공식  det(A) = ad − bc', latex: `\\det(A) = ${formatNum(m[0][0])} \\times ${formatNum(m[1][1])} - ${formatNum(m[0][1])} \\times ${formatNum(m[1][0])}` });
    steps.push({ label: 'Step 3: 계산', latex: `= ${formatNum(m[0][0] * m[1][1])} - (${formatNum(m[0][1] * m[1][0])}) = ${formatNum(det)}` });
  } else {
    // Gaussian elimination to show row ops
    let A = m.map(r => [...r]);
    let sign = 1;
    let stepIdx = 2;
    for (let col = 0; col < n; col++) {
      // Partial pivot
      let maxRow = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(A[r][col]) > Math.abs(A[maxRow][col])) maxRow = r;
      if (maxRow !== col) {
        [A[col], A[maxRow]] = [A[maxRow], A[col]];
        sign *= -1;
        steps.push({ label: `Step ${stepIdx++}: 행 ${col+1} ↔ 행 ${maxRow+1} (행 교환, 부호 반전)`, latex: matrixToLatex(A) });
      }
      if (Math.abs(A[col][col]) < 1e-12) continue;
      for (let r = col + 1; r < n; r++) {
        const factor = A[r][col] / A[col][col];
        if (Math.abs(factor) < 1e-12) continue;
        for (let c = col; c < n; c++) A[r][c] -= factor * A[col][c];
        steps.push({ label: `Step ${stepIdx++}: R${r+1} ← R${r+1} − (${formatNum(factor)}) × R${col+1}`, latex: matrixToLatex(A) });
      }
    }
    const diag = A.map((r, i) => r[i]);
    const diagStr = diag.map((v, i) => `u_{${i+1}${i+1}} = ${formatNum(v)}`).join(',\;');
    steps.push({ label: `Step ${stepIdx++}: 상삼각행렬 U 완성 — 대각선 원소`, latex: diagStr });
    const diagProd = diag.reduce((acc, v) => acc * v, sign);
    steps.push({ label: `Step ${stepIdx}: det(A) = ${sign < 0 ? '-' : ''}(${diag.map(v => formatNum(v)).join(' \\times ')})`, latex: `\\det(A) = ${formatNum(diagProd)}` });
  }

  return { value: det, steps, latex: `\\det(A) = ${formatNum(det)}` };
}

// ── Inverse ───────────────────────────────────────────────────────────────
export function calcInverse(m) {
  const det = math.det(math.matrix(m));
  if (Math.abs(det) < 1e-10) throw new Error(`역행렬이 존재하지 않습니다 (det = ${formatNum(det)})`);
  const n = m.length;
  const inv = math.inv(math.matrix(m))._data;

  // Show augmented matrix row reduction
  const steps = [
    { label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` },
    { label: `Step 2: 행렬식 확인 — det(A) = ${formatNum(det)} ≠ 0 → 역행렬 존재`, latex: `\\det(A) = ${formatNum(det)}` },
  ];

  // Gauss-Jordan on augmented [A | I]
  let aug = m.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
  ]);
  let stepIdx = 3;

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      steps.push({ label: `Step ${stepIdx++}: R${col+1} ↔ R${maxRow+1}`, latex: matrixToLatex(aug.map(r => r.slice(0, n))) });
    }
    const pivot = aug[col][col];
    for (let c = 0; c < 2 * n; c++) aug[col][c] /= pivot;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = aug[r][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let c = 0; c < 2 * n; c++) aug[r][c] -= factor * aug[col][c];
    }
    if (col < n - 1)
      steps.push({ label: `Step ${stepIdx++}: 열 ${col+1} 소거`, latex: matrixToLatex(aug.map(r => r.slice(0, n))) });
  }

  steps.push({ label: `Step ${stepIdx}: 결과 A⁻¹`, latex: `A^{-1} = ${matrixToLatex(inv)}` });
  return { value: inv, steps, latex: `A^{-1} = ${matrixToLatex(inv)}` };
}

// ── Transpose ─────────────────────────────────────────────────────────────
export function calcTranspose(m) {
  const T = math.transpose(math.matrix(m))._data;
  return {
    value: T,
    steps: [
      { label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` },
      { label: 'Step 2: A[i][j] → A[j][i] (행과 열 교환)', latex: `A^T_{ij} = A_{ji}` },
      { label: 'Step 3: 결과', latex: `A^T = ${matrixToLatex(T)}` },
    ],
    latex: `A^T = ${matrixToLatex(T)}`
  };
}

// ── Rank ──────────────────────────────────────────────────────────────────
export function calcRank(m) {
  const rows = m.length, cols = m[0].length;
  let A = m.map(r => [...r]);
  let rank = 0;
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  let stepIdx = 2;
  for (let col = 0; col < cols && rank < rows; col++) {
    let pivotRow = -1;
    for (let r = rank; r < rows; r++) if (Math.abs(A[r][col]) > 1e-10) { pivotRow = r; break; }
    if (pivotRow === -1) { steps.push({ label: `Step ${stepIdx++}: 열 ${col+1} — 피벗 없음 (건너뜀)`, latex: matrixToLatex(A) }); continue; }
    [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
    for (let r = 0; r < rows; r++) {
      if (r !== rank && Math.abs(A[r][col]) > 1e-10) {
        const f = A[r][col] / A[rank][col];
        for (let c = 0; c < cols; c++) A[r][c] -= f * A[rank][c];
      }
    }
    steps.push({ label: `Step ${stepIdx++}: 열 ${col+1} 소거 (피벗 행 ${rank+1})`, latex: matrixToLatex(A) });
    rank++;
  }
  steps.push({ label: '결과: 비영(非零) 행의 수 = rank', latex: `\\text{rank}(A) = ${rank}` });
  return { value: rank, steps, latex: `\\text{rank}(A) = ${rank}` };
}

// ── Power ─────────────────────────────────────────────────────────────────
export function calcPower(m, n) {
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  if (n === 0) {
    const I = math.identity(m.length)._data;
    steps.push({ label: 'Step 2: A⁰ = I (항등행렬)', latex: `A^0 = ${matrixToLatex(I)}` });
    return { value: I, steps, latex: `A^0 = ${matrixToLatex(I)}` };
  }
  let base = m;
  if (n < 0) { base = math.inv(math.matrix(m))._data; steps.push({ label: 'Step 2: n<0 이므로 역행렬로 변환', latex: `A^{-1} = ${matrixToLatex(base)}` }); }
  let R = math.identity(m.length)._data;
  const absN = Math.abs(n);
  for (let i = 0; i < absN; i++) {
    R = math.multiply(math.matrix(R), math.matrix(base))._data;
    if (i < 4) steps.push({ label: `Step ${steps.length + 1}: A^${i+1}`, latex: matrixToLatex(R) });
    else if (i === 4) steps.push({ label: `... (${absN}번 반복)`, latex: '' });
  }
  steps.push({ label: '결과', latex: `A^{${n}} = ${matrixToLatex(R)}` });
  return { value: R, steps, latex: `A^{${n}} = ${matrixToLatex(R)}` };
}

// ── LU Decomposition ──────────────────────────────────────────────────────
export function calcLU(m) {
  const n = m.length;
  let U = m.map(r => [...r]);
  let L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
  const steps = [
    { label: 'Step 1: 원본 행렬 A', latex: `A = ${matrixToLatex(m)}` },
    { label: 'Step 2: L을 단위행렬, U = A 로 초기화', latex: `L = ${matrixToLatex(L)},\\quad U = ${matrixToLatex(U)}` },
  ];
  for (let k = 0; k < n; k++) {
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(U[k][k]) < 1e-12) continue;
      const factor = U[i][k] / U[k][k];
      L[i][k] = factor;
      for (let j = k; j < n; j++) U[i][j] -= factor * U[k][j];
    }
    steps.push({ label: `Step ${k + 3}: 열 ${k+1} 소거 — 승수(multiplier) L에 저장`, latex: `L = ${matrixToLatex(L)},\\quad U = ${matrixToLatex(U)}` });
  }
  steps.push({ label: '검증: A = L × U', latex: `${matrixToLatex(m)} = ${matrixToLatex(L)} \\times ${matrixToLatex(U)}` });
  return {
    L, U,
    steps,
    latex: `L = ${matrixToLatex(L)},\\quad U = ${matrixToLatex(U)}`
  };
}

// ── Eigenvalues / Eigenvectors ────────────────────────────────────────────
export function calcEigen(m) {
  const steps = [{ label: 'Step 1: 원본 행렬', latex: `A = ${matrixToLatex(m)}` }];
  steps.push({ label: 'Step 2: 특성 방정식 det(A − λI) = 0 풀기', latex: `\\det(A - \\lambda I) = 0` });
  try {
    const result = math.eigs(math.matrix(m));
    // math.js v15+: eigenvectors is [{value, vector}]
    const eigvecs = result.eigenvectors;
    eigvecs.forEach(({ value, vector }, i) => {
      const vec = vector.toArray ? vector.toArray() : (Array.isArray(vector) ? vector : []);
      const re = math.re(value), im = math.im(value);
      const lamStr = im !== 0 ? `${formatNum(re)} ${im >= 0 ? '+' : ''}${formatNum(im)}i` : formatNum(re);
      const colReal = vec.map(x => (typeof x === 'object' && x !== null) ? math.re(x) : x);
      steps.push({
        label: `고유값 λ${i+1} = ${lamStr}`,
        latex: `\\lambda_{${i+1}} = ${lamStr},\\quad \\mathbf{v}_{${i+1}} = ${vectorToLatex(colReal)}`
      });
    });
    const resultLatex = eigvecs.map(({ value }, i) => {
      const re = math.re(value), im = math.im(value);
      return `\\lambda_{${i+1}} = ${im !== 0 ? `${formatNum(re)}${im >= 0 ? '+' : ''}${formatNum(im)}i` : formatNum(re)}`;
    }).join(',\\quad ');
    steps.push({ label: '결과 요약', latex: resultLatex });
    return { values: eigvecs.map(e => e.value), steps, latex: resultLatex };
  } catch (e) {
    throw new Error('고유값 계산 실패: ' + e.message);
  }
}

// ── SVD ───────────────────────────────────────────────────────────────────
export function calcSVD(m) {
  const rows = m.length, cols = m[0].length;
  const steps = [{ label: 'Step 1: 원본 행렬 A', latex: `A = ${matrixToLatex(m)}` }];
  try {
    const A   = math.matrix(m);
    const AT  = math.transpose(A);
    const ATA = math.multiply(AT, A);
    const ATAarr = ATA.toArray ? ATA.toArray() : ATA._data;
    steps.push({ label: 'Step 2: AᵀA 계산', latex: `A^T A = ${matrixToLatex(ATAarr)}` });

    const eigResult = math.eigs(ATA);
    const eigvecs = eigResult.eigenvectors; // [{value, vector}] in math.js v15+

    // Sort by eigenvalue descending so σ₁ ≥ σ₂ ≥ …
    const sorted = eigvecs
      .map(({ value, vector }) => ({
        lambda: math.re(value),
        vec: (vector.toArray ? vector.toArray() : vector)
          .map(x => (typeof x === 'object' && x !== null) ? math.re(x) : Number(x))
      }))
      .sort((a, b) => b.lambda - a.lambda);

    const k = Math.min(rows, cols);
    const sigmas = sorted.slice(0, k).map(e => Math.sqrt(Math.max(0, e.lambda)));

    steps.push({
      label: 'Step 3: AᵀA 고유값 → 특이값 σᵢ = √λᵢ',
      latex: sigmas.map((s, i) =>
        `\\sigma_{${i+1}} = \\sqrt{${formatNum(sorted[i].lambda)}} = ${formatNum(s)}`
      ).join(',\\quad ')
    });

    // V (n×k): columns are right singular vectors (eigenvectors of AᵀA)
    const Vmat = Array.from({ length: cols }, (_, r) =>
      sorted.slice(0, k).map(e => e.vec[r] ?? 0)
    );
    steps.push({ label: 'Step 4: V 행렬 (AᵀA의 고유벡터 — 우 특이벡터)', latex: `V = ${matrixToLatex(Vmat)}` });

    // U (m×k): u_i = (1/σ_i) A v_i
    const Umat = Array.from({ length: rows }, () => Array(k).fill(0));
    for (let i = 0; i < k; i++) {
      if (sigmas[i] < 1e-10) continue;
      for (let r = 0; r < rows; r++) {
        let sum = 0;
        for (let c = 0; c < cols; c++) sum += m[r][c] * sorted[i].vec[c];
        Umat[r][i] = sum / sigmas[i];
      }
    }
    steps.push({ label: 'Step 5: U 행렬  uᵢ = (1/σᵢ) · A·vᵢ  (좌 특이벡터)', latex: `U = ${matrixToLatex(Umat)}` });

    // Σ (k×k diagonal)
    const Sigmat = Array.from({ length: k }, (_, i) =>
      Array.from({ length: k }, (_, j) => (i === j ? sigmas[i] : 0))
    );

    // V^T (k×n)
    const VTobj = math.transpose(math.matrix(Vmat));
    const VTmat = VTobj.toArray ? VTobj.toArray() : VTobj._data;
    steps.push({ label: 'Step 6: Vᵀ', latex: `V^T = ${matrixToLatex(VTmat)}` });
    steps.push({ label: '완성: A = U · Σ · Vᵀ', latex: `A = U \\cdot \\Sigma \\cdot V^T` });

    const resultLatex = sigmas.map((s, i) => `\\sigma_{${i+1}} = ${formatNum(s)}`).join(',\\quad ');

    return {
      singularValues: sigmas,
      U: Umat, V: Vmat, VT: VTmat,
      steps,
      latex: `A = U \\cdot \\Sigma \\cdot V^T \\quad (${resultLatex})`,
      U_latex:     `U = ${matrixToLatex(Umat)}`,
      Sigma_latex: `\\Sigma = ${matrixToLatex(Sigmat)}`,
      VT_latex:    `V^T = ${matrixToLatex(VTmat)}`,
    };
  } catch (e) {
    throw new Error('SVD 계산 실패: ' + e.message);
  }
}

// ── Two-matrix operations ─────────────────────────────────────────────────
export function calcMultiply(a, b) {
  if (a[0].length !== b.length) throw new Error(`차원 불일치: ${a.length}×${a[0].length} × ${b.length}×${b[0].length}`);
  const result = math.multiply(math.matrix(a), math.matrix(b))._data;
  const steps = [
    { label: 'Step 1: 행렬 A', latex: `A = ${matrixToLatex(a)}` },
    { label: 'Step 2: 행렬 B', latex: `B = ${matrixToLatex(b)}` },
    { label: 'Step 3: C[i][j] = Σ A[i][k] · B[k][j]', latex: `C = A \\times B = ${matrixToLatex(result)}` },
  ];
  return { value: result, steps, latex: `A \\times B = ${matrixToLatex(result)}` };
}

export function calcAdd(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('행렬 크기가 같아야 합니다');
  const result = math.add(math.matrix(a), math.matrix(b))._data;
  return {
    value: result,
    steps: [
      { label: 'Step 1', latex: `A = ${matrixToLatex(a)}` },
      { label: 'Step 2', latex: `B = ${matrixToLatex(b)}` },
      { label: '결과', latex: `A + B = ${matrixToLatex(result)}` },
    ],
    latex: `A + B = ${matrixToLatex(result)}`
  };
}

export function calcSubtract(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error('행렬 크기가 같아야 합니다');
  const result = math.subtract(math.matrix(a), math.matrix(b))._data;
  return {
    value: result,
    steps: [
      { label: 'Step 1', latex: `A = ${matrixToLatex(a)}` },
      { label: 'Step 2', latex: `B = ${matrixToLatex(b)}` },
      { label: '결과', latex: `A - B = ${matrixToLatex(result)}` },
    ],
    latex: `A - B = ${matrixToLatex(result)}`
  };
}

// ── Multi-matrix chain operations ─────────────────────────────────────────
const CHAIN_LABELS = ['A', 'B', 'C', 'D'];

export function calcMultiplyChain(matrices) {
  const steps = matrices.map((m, i) => ({
    label: `행렬 ${CHAIN_LABELS[i]}`,
    latex: `${CHAIN_LABELS[i]} = ${matrixToLatex(m)}`
  }));
  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++) {
    if (result[0].length !== matrices[i].length)
      throw new Error(`차원 불일치: (${result.length}×${result[0].length}) × (${matrices[i].length}×${matrices[i][0].length})`);
    result = math.multiply(math.matrix(result), math.matrix(matrices[i]))._data;
    const expr = CHAIN_LABELS.slice(0, i + 1).join(' \\times ');
    steps.push({ label: `${CHAIN_LABELS.slice(0, i).join('×')} × ${CHAIN_LABELS[i]} 계산`, latex: `${expr} = ${matrixToLatex(result)}` });
  }
  const expr = CHAIN_LABELS.slice(0, matrices.length).join(' \\times ');
  return { value: result, steps, latex: `${expr} = ${matrixToLatex(result)}` };
}

export function calcAddChain(matrices) {
  const [rows, cols] = [matrices[0].length, matrices[0][0].length];
  for (let i = 1; i < matrices.length; i++)
    if (matrices[i].length !== rows || matrices[i][0].length !== cols)
      throw new Error('행렬 크기가 모두 같아야 합니다');
  const steps = matrices.map((m, i) => ({ label: `행렬 ${CHAIN_LABELS[i]}`, latex: `${CHAIN_LABELS[i]} = ${matrixToLatex(m)}` }));
  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++)
    result = math.add(math.matrix(result), math.matrix(matrices[i]))._data;
  const expr = CHAIN_LABELS.slice(0, matrices.length).join(' + ');
  steps.push({ label: '결과', latex: `${expr} = ${matrixToLatex(result)}` });
  return { value: result, steps, latex: `${expr} = ${matrixToLatex(result)}` };
}

export function calcSubtractChain(matrices) {
  const [rows, cols] = [matrices[0].length, matrices[0][0].length];
  for (let i = 1; i < matrices.length; i++)
    if (matrices[i].length !== rows || matrices[i][0].length !== cols)
      throw new Error('행렬 크기가 모두 같아야 합니다');
  const steps = matrices.map((m, i) => ({ label: `행렬 ${CHAIN_LABELS[i]}`, latex: `${CHAIN_LABELS[i]} = ${matrixToLatex(m)}` }));
  let result = matrices[0];
  for (let i = 1; i < matrices.length; i++)
    result = math.subtract(math.matrix(result), math.matrix(matrices[i]))._data;
  const expr = CHAIN_LABELS.slice(0, matrices.length).join(' - ');
  steps.push({ label: '결과', latex: `${expr} = ${matrixToLatex(result)}` });
  return { value: result, steps, latex: `${expr} = ${matrixToLatex(result)}` };
}
