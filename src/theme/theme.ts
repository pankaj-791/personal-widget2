import { useColorScheme } from 'react-native';

export type Theme = {
  dark: boolean;
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  accent: string;
  accentText: string;
  tabBar: string;
};

export const darkTheme: Theme = {
  dark: true,
  background: '#000000',
  card: '#1A1B1F',
  cardBorder: '#2A2B31',
  text: '#FFFFFF',
  textMuted: '#9A9BA3',
  accent: '#FFFFFF',
  accentText: '#000000',
  tabBar: '#0E0F12',
};

export const lightTheme: Theme = {
  dark: false,
  background: '#F2F2F5',
  card: '#FFFFFF',
  cardBorder: '#E3E3E8',
  text: '#0B0B0D',
  textMuted: '#6B6C75',
  accent: '#0B0B0D',
  accentText: '#FFFFFF',
  tabBar: '#FFFFFF',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'light' ? lightTheme : darkTheme;
}

export const radius = {
  card: 28,
  pill: 999,
  small: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
