import { ExtraStyle } from './extraStyle';
export type FontKey = 'sans' | 'light' | 'condensed' | 'serif' | 'mono';
export type WidgetKind = 'clock' | 'date' | 'text';
export type FontWeight = '300' | '400' | '700' | '800';

export type CustomWidgetSpec = {
  id: string;
  name: string;
  description: string;
  kind: WidgetKind;
  text: string;
  icon: string;
  backgroundColor: string;
  textColor: string;
  font: FontKey;
  weight: FontWeight;
  borderRadius: number;
  padding: number;
  widthPct: number;
  height: number;
  hour12: boolean;
  showDate: boolean;
  imageUri: string | null;
    extra?: Partial<ExtraStyle>;
};

export const FONTS: { key: FontKey; label: string; family: string }[] = [
  { key: 'sans', label: 'Sans', family: 'sans-serif' },
  { key: 'light', label: 'Light', family: 'sans-serif-light' },
  { key: 'condensed', label: 'Condensed', family: 'sans-serif-condensed' },
  { key: 'serif', label: 'Serif', family: 'serif' },
  { key: 'mono', label: 'Mono', family: 'monospace' },
];

export function fontFamily(key: FontKey): string {
  return FONTS.find((f) => f.key === key)?.family ?? 'sans-serif';
}

export const LIMITS = {
  borderRadius: { min: 0, max: 48 },
  padding: { min: 8, max: 40 },
  widthPct: { min: 40, max: 100 },
  height: { min: 80, max: 280 },
};

export const COLOR_PRESETS: string[] = [
  '#000000',
  '#FFFFFF',
  '#1A1B1F',
  '#F5A623',
  '#7C9CFF',
  '#22C55E',
  '#EC4899',
  '#FFD60A',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampSpec(spec: CustomWidgetSpec): CustomWidgetSpec {
  return {
    ...spec,
    borderRadius: clamp(
      spec.borderRadius,
      LIMITS.borderRadius.min,
      LIMITS.borderRadius.max
    ),
    padding: clamp(spec.padding, LIMITS.padding.min, LIMITS.padding.max),
    widthPct: clamp(spec.widthPct, LIMITS.widthPct.min, LIMITS.widthPct.max),
    height: clamp(spec.height, LIMITS.height.min, LIMITS.height.max),
  };
}

export function contrastColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#FFFFFF';
}

export const DEFAULT_SPEC: CustomWidgetSpec = {
  id: 'draft',
  name: 'Custom clock',
  description: '',
  kind: 'clock',
  text: 'Hello',
  icon: '',
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
  font: 'sans',
  weight: '700',
  borderRadius: 28,
  padding: 20,
  widthPct: 100,
  height: 150,
  hour12: false,
  showDate: true,
  imageUri: null,
};

const COLORS: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  red: '#E5484D',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#FFD60A',
  orange: '#F5A623',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280',
  grey: '#6B7280',
  teal: '#14B8A6',
  navy: '#1F3A8A',
  gold: '#D4AF37',
  cyan: '#06B6D4',
  brown: '#92400E',
  beige: '#F5F5DC',
  cream: '#FFF8E7',
  silver: '#C0C0C0',
  maroon: '#7F1D1D',
  lime: '#84CC16',
};

const BACKGROUND_WORDS = ['background', 'bg', 'card', 'backdrop'];
const TEXT_WORDS = [
  'text',
  'numbers',
  'number',
  'digits',
  'digit',
  'font',
  'letters',
  'lettering',
  'numerals',
];

const ICONS: Record<string, string> = {
  weather: '☀️',
  sun: '☀️',
  sunny: '☀️',
  moon: '🌙',
  night: '🌙',
  music: '🎵',
  heart: '❤️',
  love: '❤️',
  star: '⭐',
  fire: '🔥',
  rocket: '🚀',
  coffee: '☕',
  game: '🎮',
  alarm: '⏰',
  bell: '🔔',
  flower: '🌸',
};

function hasAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

export function generateFromDescription(
  description: string
): CustomWidgetSpec {
  const raw = description.trim();
  const lower = raw.toLowerCase();
  const tokens = lower
    .replace(/[^a-z0-9\-]+/g, ' ')
    .split(' ')
    .filter((x) => x.length > 0);

  // Kind of widget
  let kind: WidgetKind = 'text';
  if (tokens.includes('clock') || tokens.includes('time')) kind = 'clock';
  else if (tokens.includes('date') || tokens.includes('day')) kind = 'date';

  // Quoted text for text widgets
  const quoted = raw.match(/["“]([^"”“]{1,60})["”]/);
  const text = quoted ? quoted[1].trim() : 'Hello';

  // Colors: assign by the word that follows each color name
  let background: string | null = null;
  let textColor: string | null = null;
  const unassigned: string[] = [];
  tokens.forEach((token, i) => {
    const hex = COLORS[token];
    if (!hex) return;
    const next = tokens.slice(i + 1, i + 3);
    if (next.some((n) => TEXT_WORDS.includes(n)) && textColor === null) {
      textColor = hex;
    } else if (
      next.some((n) => BACKGROUND_WORDS.includes(n)) &&
      background === null
    ) {
      background = hex;
    } else {
      unassigned.push(hex);
    }
  });
  if (background === null && unassigned.length > 0) {
    background = unassigned.shift() as string;
  }
  if (textColor === null && unassigned.length > 0) {
    textColor = unassigned.shift() as string;
  }
  const finalBackground = background ?? DEFAULT_SPEC.backgroundColor;
  const finalText = textColor ?? contrastColor(finalBackground);

  // Font and weight
  let font: FontKey = 'sans';
  if (hasAny(lower, ['serif'])) font = 'serif';
  else if (hasAny(lower, ['mono', 'code', 'typewriter'])) font = 'mono';
  else if (hasAny(lower, ['condensed', 'narrow'])) font = 'condensed';

  let weight: FontWeight = '700';
  if (hasAny(lower, ['bold', 'heavy', 'chunky', 'thick'])) weight = '800';
  else if (hasAny(lower, ['thin', 'light', 'minimal', 'slim', 'elegant'])) {
    weight = '300';
  }

  // Corners
  let borderRadius = 24;
  if (hasAny(lower, ['pill', 'very rounded', 'extra rounded'])) {
    borderRadius = 48;
  } else if (
    hasAny(lower, ['sharp', 'square corners', 'no rounded', 'straight corners'])
  ) {
    borderRadius = 0;
  } else if (hasAny(lower, ['rounded', 'round'])) {
    borderRadius = 28;
  }

  // Spacing
  let padding = 20;
  if (hasAny(lower, ['spacious', 'roomy', 'airy'])) padding = 32;
  else if (hasAny(lower, ['tight', 'compact'])) padding = 10;

  // Size
  let widthPct = 100;
  let height = kind === 'text' ? 120 : 150;
  if (hasAny(lower, ['small', 'tiny', 'compact'])) {
    widthPct = 60;
    height = 100;
  } else if (hasAny(lower, ['large', 'big', 'huge'])) {
    widthPct = 100;
    height = 220;
  } else if (hasAny(lower, ['tall'])) {
    widthPct = 70;
    height = 220;
  } else if (hasAny(lower, ['wide'])) {
    widthPct = 100;
    height = 120;
  }

  // Time options
  const hour12 = hasAny(lower, ['12-hour', '12 hour', '12h', 'am/pm', 'am pm']);
  const showDate = !hasAny(lower, ['no date', 'without date', 'hide date']);

  // Icon
  let icon = '';
  for (const token of tokens) {
    if (ICONS[token]) {
      icon = ICONS[token];
      break;
    }
  }

  const name =
    kind === 'clock'
      ? 'Custom clock'
      : kind === 'date'
      ? 'Custom date'
      : text.slice(0, 20);

  return clampSpec({
    id: `w-${Date.now()}`,
    name,
    description: raw,
    kind,
    text,
    icon,
    backgroundColor: finalBackground,
    textColor: finalText,
    font,
    weight,
    borderRadius,
    padding,
    widthPct,
    height,
    hour12,
    showDate,
    imageUri: null,
  });
    }
