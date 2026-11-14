import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { launchApp } from '../../native/InstalledApps';
import { QuickLaunchWidget, WidgetApp } from './QuickLaunchWidget';
import { PersonalCardWidget, WidgetCard } from './PersonalCardWidget';

const QUICK_LAUNCH_KEY = 'quickLaunch.v1';
const PERSONAL_CARD_KEY = 'personalCard.v1';

function isApp(x: unknown): x is WidgetApp {
  return (
    x !== null &&
    typeof x === 'object' &&
    typeof (x as WidgetApp).packageName === 'string' &&
    typeof (x as WidgetApp).icon === 'string'
  );
}

async function readQuickLaunch(): Promise<WidgetApp[]> {
  try {
    const raw = await AsyncStorage.getItem(QUICK_LAUNCH_KEY);
    if (raw === null) return [];
    const list: unknown = JSON.parse(raw);
    return Array.isArray(list) ? list.filter(isApp) : [];
  } catch {
    return [];
  }
}

async function readPersonalCard(): Promise<WidgetCard> {
  const fallback: WidgetCard = {
    name: 'Your name',
    tagline: 'Open the app to edit',
    slots: [null, null, null, null],
  };
  try {
    const raw = await AsyncStorage.getItem(PERSONAL_CARD_KEY);
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

// The library reports the widget size. It may be in pixels or dp, so we
// convert large numbers from pixels to dp.
function widthInDp(props: WidgetTaskHandlerProps): number {
  try {
    const info = props.widgetInfo as unknown as {
      width?: number;
      screenInfo?: { density?: number };
    };
    const w = typeof info.width === 'number' ? info.width : 0;
    if (w <= 0) return 300;
    if (w > 700) {
      const density = info.screenInfo?.density ?? 2.75;
      return w / (density > 0 ? density : 2.75);
    }
    return w;
  } catch {
    return 300;
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    const name = props.widgetInfo.widgetName;

    if (props.widgetAction === 'WIDGET_CLICK') {
      if (props.clickAction === 'LAUNCH_APP') {
        const data = props.clickActionData as
          | { packageName?: string }
          | undefined;
        if (data && typeof data.packageName === 'string') {
          await launchApp(data.packageName);
        }
      }
      return;
    }

    if (
      props.widgetAction === 'WIDGET_ADDED' ||
      props.widgetAction === 'WIDGET_UPDATE' ||
      props.widgetAction === 'WIDGET_RESIZED'
    ) {
      if (name === 'PwQuickLaunch') {
        const apps = await readQuickLaunch();
        props.renderWidget(
          <QuickLaunchWidget apps={apps} widthDp={widthInDp(props)} />
        );
      } else if (name === 'PwPersonalCard') {
        const card = await readPersonalCard();
        props.renderWidget(<PersonalCardWidget card={card} />);
      }
    }
  } catch {
    // A widget error must never crash the app.
  }
}
