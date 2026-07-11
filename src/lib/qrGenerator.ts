/**
 * Lightweight QR Code generator — renders to a canvas element.
 * Based on the QR code specification (Version 2, Error Correction Level M).
 * For simple numeric/alphanumeric data like an 8-digit code.
 */

// Pre-computed generator for simple QR codes using canvas API
export function renderQRCode(canvas: HTMLCanvasElement, data: string, size: number = 200): void {
  const modules = generateQRMatrix(data);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  // Modules
  ctx.fillStyle = "#000000";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (modules[row][col]) {
        ctx.fillRect(
          Math.round(col * cellSize),
          Math.round(row * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }
}

// ── Simplified QR Matrix Generator ──────────────────────────────
// Uses a basic encoding approach suitable for short numeric strings

function generateQRMatrix(data: string): boolean[][] {
  // For an 8-digit code, we use Version 1 (21x21) with ECC level L
  const size = 21;
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // Place finder patterns (top-left, top-right, bottom-left)
  placeFinder(matrix, 0, 0);
  placeFinder(matrix, 0, size - 7);
  placeFinder(matrix, size - 7, 0);

  // Place timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Reserve format information areas
  for (let i = 0; i < 8; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = false;
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = false;
  }
  matrix[8][8] = false;

  // Encode data as binary
  const bits = encodeData(data);
  
  // Place data bits using upward/downward zigzag pattern
  let bitIndex = 0;
  let upward = true;
  
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // Skip timing column
    
    const rowRange = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);
    
    for (const row of rowRange) {
      for (const col of [right, right - 1]) {
        if (matrix[row][col] === null) {
          matrix[row][col] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          bitIndex++;
        }
      }
    }
    upward = !upward;
  }

  // Apply mask (checkerboard pattern)
  const result: boolean[][] = matrix.map((row, r) =>
    row.map((cell, c) => {
      if (cell === null) return false;
      // Only mask data areas (not finder/timing/format)
      if (isReserved(r, c, size)) return cell as boolean;
      return ((r + c) % 2 === 0) ? !(cell as boolean) : (cell as boolean);
    })
  );

  // Place format info for mask 0
  placeFormatInfo(result, size);

  return result;
}

function placeFinder(matrix: (boolean | null)[][], startRow: number, startCol: number): void {
  // 7x7 finder pattern + 1-cell separator
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const row = startRow + r;
      const col = startCol + c;
      if (row < 0 || row >= matrix.length || col < 0 || col >= matrix.length) continue;
      
      if (r === -1 || r === 7 || c === -1 || c === 7) {
        matrix[row][col] = false; // Separator
      } else if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[row][col] = true; // Border
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[row][col] = true; // Inner
      } else {
        matrix[row][col] = false;
      }
    }
  }
}

function isReserved(row: number, col: number, size: number): boolean {
  // Finder patterns + separators
  if (row <= 8 && col <= 8) return true;
  if (row <= 8 && col >= size - 8) return true;
  if (row >= size - 8 && col <= 8) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}

function encodeData(data: string): number[] {
  const bits: number[] = [];
  
  // Mode indicator: Numeric (0001)
  bits.push(0, 0, 0, 1);
  
  // Character count indicator (10 bits for Version 1 numeric)
  const len = data.length;
  for (let i = 9; i >= 0; i--) bits.push((len >> i) & 1);
  
  // Encode digits in groups of 3
  for (let i = 0; i < data.length; i += 3) {
    const group = data.substring(i, i + 3);
    const val = parseInt(group, 10);
    const numBits = group.length === 3 ? 10 : group.length === 2 ? 7 : 4;
    for (let b = numBits - 1; b >= 0; b--) bits.push((val >> b) & 1);
  }
  
  // Terminator
  bits.push(0, 0, 0, 0);
  
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);
  
  // Pad bytes to fill capacity (Version 1-L: 19 data codewords = 152 bits)
  const padBytes = [0xEC, 0x11];
  let padIdx = 0;
  while (bits.length < 152) {
    const pb = padBytes[padIdx % 2];
    for (let b = 7; b >= 0; b--) bits.push((pb >> b) & 1);
    padIdx++;
  }
  
  return bits;
}

function placeFormatInfo(matrix: boolean[][], size: number): void {
  // Format info for Mask 0, ECC Level L: 111011111000100
  const formatBits = [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0];
  
  // Around top-left finder
  for (let i = 0; i <= 5; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;
  
  // Around top-right and bottom-left finders
  for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = formatBits[i] === 1;
  for (let i = 8; i < 15; i++) matrix[size - 15 + i][8] = formatBits[i] === 1;
}
