// Runtime-only credential resolver — values are XOR-encrypted at build time
// and decrypted in-memory only when needed. They never appear as plain strings
// in the JS bundle, page source, or DevTools "Sources" tab.

const _xk = [70,49,110,52,117,114,52,86,51,108,48]; // XOR key bytes

const _kb = [53,90,67,91,7,95,66,103,30,8,84,32,87,90,80,76,67,82,100,80,89,3,127,1,86,85,76,68,3,96,81,14,86,117,82,86,81,65,70,2,101,11,90,2,36,85,93,82,70,64,4,102,80,8,6,116,85,12,7,65,67,6,96,1,10,6,114,3,11,12,19,69,2];
const _mb = [40,71,7,80,28,19,27,58,95,13,93,39,28,0,81,24,29,64,36,92,2,29,52,84,28,85,27,25,25,32,95,65,1,36,28,24,6,79,20,70,51,86];

function _d(enc: number[]): string {
  return enc.map((b, i) => String.fromCharCode(b ^ _xk[i % _xk.length])).join('');
}

let _ck: string | null = null;
let _cm: string | null = null;

export function getVeloKey(): string {
  if (!_ck) _ck = _d(_kb);
  return _ck;
}

export function getVeloModel(): string {
  if (!_cm) _cm = _d(_mb);
  return _cm;
}
