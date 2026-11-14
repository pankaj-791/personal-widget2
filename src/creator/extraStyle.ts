export type Align = 'left' | 'center' | 'right';

export type ExtraStyle = {
  glass: boolean;
  glassStrength: number; // fill opacity in percent while glass is on
  opacity: number; // background opacity in percent
  borderWidth: number;
  borderColor: string;
  shadow: boolean;
  align: Align;
  letterSpacing: number;
  textShadow: boolean;
};

export const DEFAULT_EXTRA: ExtraStyle = {
  glass: false,
  glassStrength: 25,
  opacity: 100,
  borderWidth: 0,
  borderColor: '#FFFFFF',
  shadow: false,
  align: 'center',
  letterSpacing: 0,
  textShadow: false,
};

export const EXTRA_LIMITS = {
  glassStrength: { min: 5, max: 60 },
  opacity: { min: 20, max: 100 },
  borderWidth: { min: 0, max: 6 },
  letterSpacing: { min: -2, max: 8 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getExtra(spec: { extra?: Partial<ExtraStyle> }): ExtraStyle {
  const e = { ...DEFAULT_EXTRA, ...(spec.extra ?? {}) };
  return {
    ...e,
    glassStrength: clamp(
      e.glassStrength,
      EXTRA_LIMITS.glassStrength.min,
      EXTRA_LIMITS.glassStrength.max
    ),
    opacity: clamp(e.opacity, EXTRA_LIMITS.opacity.min, EXTRA_LIMITS.opacity.max),
    borderWidth: clamp(
      e.borderWidth,
      EXTRA_LIMITS.borderWidth.min,
      EXTRA_LIMITS.borderWidth.max
    ),
    letterSpacing: clamp(
      e.letterSpacing,
      EXTRA_LIMITS.letterSpacing.min,
      EXTRA_LIMITS.letterSpacing.max
    ),
  };
}

// Turns "#RRGGBB" and a percent (0 to 100) into "rgba(r, g, b, a)".
export function withAlpha(hex: string, percent: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(0, 0, 0, ${percent / 100})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${clamp(percent, 0, 100) / 100})`;
                     }
