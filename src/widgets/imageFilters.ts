// A color matrix has 20 numbers: 4 rows (R, G, B, A) of 5 values each.
// The first 4 values in a row multiply R, G, B, A. The 5th is an offset (0 to 1).
export type Matrix = number[];

export type FilterName = 'original' | 'bw' | 'sepia' | 'vintage';

export const FILTERS: { key: FilterName; label: string }[] = [
  { key: 'original', label: 'Original' },
  { key: 'bw', label: 'B & W' },
  { key: 'sepia', label: 'Sepia' },
  { key: 'vintage', label: 'Vintage' },
];

export type Adjustments = {
  brightness: number; // -0.3 to 0.3, 0 = no change
  contrast: number; // 0.6 to 1.4, 1 = no change
  saturation: number; // 0 to 2, 1 = no change
};

export const defaultAdjustments: Adjustments = {
  brightness: 0,
  contrast: 1,
  saturation: 1,
};

const IDENTITY: Matrix = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

// Returns the matrix that applies b first, then a.
function multiply(a: Matrix, b: Matrix): Matrix {
  const out: Matrix = new Array(20).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 5; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[i * 5 + k] * b[k * 5 + j];
      }
      if (j === 4) sum += a[i * 5 + 4];
      out[i * 5 + j] = sum;
    }
  }
  return out;
}

function saturationMatrix(s: number): Matrix {
  const lr = 0.2126;
  const lg = 0.7152;
  const lb = 0.0722;
  const inv = 1 - s;
  return [
    lr * inv + s, lg * inv, lb * inv, 0, 0,
    lr * inv, lg * inv + s, lb * inv, 0, 0,
    lr * inv, lg * inv, lb * inv + s, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function contrastMatrix(c: number): Matrix {
  const o = 0.5 * (1 - c);
  return [
    c, 0, 0, 0, o,
    0, c, 0, 0, o,
    0, 0, c, 0, o,
    0, 0, 0, 1, 0,
  ];
}

function brightnessMatrix(b: number): Matrix {
  return [
    1, 0, 0, 0, b,
    0, 1, 0, 0, b,
    0, 0, 1, 0, b,
    0, 0, 0, 1, 0,
  ];
}

const SEPIA: Matrix = [
  0.393, 0.769, 0.189, 0, 0,
  0.349, 0.686, 0.168, 0, 0,
  0.272, 0.534, 0.131, 0, 0,
  0, 0, 0, 1, 0,
];

const VINTAGE_TINT: Matrix = [
  1.1, 0, 0, 0, 0.03,
  0, 1.0, 0, 0, 0.01,
  0, 0, 0.85, 0, 0,
  0, 0, 0, 1, 0,
];

function filterMatrix(filter: FilterName): Matrix {
  switch (filter) {
    case 'bw':
      return saturationMatrix(0);
    case 'sepia':
      return SEPIA;
    case 'vintage':
      return multiply(
        VINTAGE_TINT,
        multiply(contrastMatrix(0.9), saturationMatrix(0.7))
      );
    default:
      return IDENTITY;
  }
}

// Filter first, then saturation, contrast and brightness on top.
export function buildMatrix(filter: FilterName, adj: Adjustments): Matrix {
  let m = filterMatrix(filter);
  m = multiply(saturationMatrix(adj.saturation), m);
  m = multiply(contrastMatrix(adj.contrast), m);
  m = multiply(brightnessMatrix(adj.brightness), m);
  return m;
  }
