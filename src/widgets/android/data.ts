import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetApp } from './QuickLaunchWidget';
import type { WidgetCard } from './PersonalCardWidget';

const QUICK_LAUNCH_KEY = 'quickLaunch.v1';
const PERSONAL_CARD_KEY = 'personalCard.v1';

export function isApp(x: unknown): x is WidgetApp {
  return (
    x !== null &&
    typeof x === 'object' &&
    typeof (x as WidgetApp).packageName === 'string' &&
    typeof (x as WidgetApp).icon === 'string'
  );
}

export async function readText(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function writeText(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Saving failed. The widget still shows the new state once.
  }
}

export async function readQuickLaunch(): Promise<WidgetApp[]> {
  try {
    const raw = await readText(QUICK_LAUNCH_KEY);
    if (raw === null) return [];
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? list.filter(isApp) : [];
  } catch {
    return [];
  }
}

export async function readPersonalCard(): Promise<WidgetCard> {
  const fallback: WidgetCard = {
    name: 'Your name',
    tagline: 'Open the app to edit',
    slots: [null, null, null, null],
  };
  try {
    const raw = await readText(PERSONAL_CARD_KEY);
    if (raw === null) return fallback;
    const data = JSON.parse(raw) as Partial<WidgetCard> | null;
    if (data === null || typeof data !== 'object') return fallback;
    const slots = [0, 1, 2, 3].map((i) => {
      const s = Array.isArray(data.slots) ? data.slots[i] : null;
      return isApp(s) ? s : null;
    });
    return {
      name: typeof data.name === 'string' ? data.name : fallback.name,
      tagline:
        typeof data.tagline === 'string' ? data.tagline : fallback.tagline,
      slots,
    };
  } catch {
    return fallback;
  }
}
