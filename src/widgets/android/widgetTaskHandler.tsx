import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { launchApp } from '../../native/InstalledApps';
import { HelloWidget } from './HelloWidget';
import { QuickLaunchWidget, WidgetApp } from './QuickLaunchWidget';

const TAPS_KEY = 'androidWidget.hello.taps';
const QUICK_LAUNCH_KEY = 'quickLaunch.v1';

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function timeNow(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function readTaps(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(TAPS_KEY);
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function readQuickLaunch(): Promise<WidgetApp[]> {
  try {
    const raw = await AsyncStorage.getItem(QUICK_LAUNCH_KEY);
    if (raw === null) return [];
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (x): x is WidgetApp =>
        x !== null &&
        typeof x === 'object' &&
        typeof (x as WidgetApp).packageName === 'string' &&
        typeof (x as WidgetApp).icon === 'string'
    );
  } catch {
    return [];
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

    if (name === 'PwHello') {
      switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED': {
          const taps = await readTaps();
          props.renderWidget(<HelloWidget taps={taps} updatedAt={timeNow()} />);
          break;
        }
        case 'WIDGET_CLICK': {
          if (props.clickAction === 'TEST_TAP') {
            const taps = (await readTaps()) + 1;
            try {
              await AsyncStorage.setItem(TAPS_KEY, String(taps));
            } catch {
              // Saving failed. The widget still shows the new number once.
            }
            props.renderWidget(
              <HelloWidget taps={taps} updatedAt={timeNow()} />
            );
          }
          break;
        }
        default:
          break;
      }
      return;
    }

    if (name === 'PwQuickLaunch') {
      switch (props.widgetAction) {
        case 'WIDGET_ADDED':
        case 'WIDGET_UPDATE':
        case 'WIDGET_RESIZED': {
          const apps = await readQuickLaunch();
          props.renderWidget(
            <QuickLaunchWidget apps={apps} widthDp={widthInDp(props)} />
          );
          break;
        }
        case 'WIDGET_CLICK': {
          if (props.clickAction === 'LAUNCH_APP') {
            const data = props.clickActionData as
              | { packageName?: string }
              | undefined;
            if (data && typeof data.packageName === 'string') {
              await launchApp(data.packageName);
            }
          }
          break;
        }
        default:
          break;
      }
    }
  } catch {
    // A widget error must never crash the app.
  }
}
