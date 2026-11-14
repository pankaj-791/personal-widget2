import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { launchApp } from '../../native/InstalledApps';
import { QuickLaunchWidget, WidgetApp } from './QuickLaunchWidget';
import { PersonalCardWidget, WidgetCard } from './PersonalCardWidget';
import { CalendarWidget } from './CalendarWidget';

const QUICK_LAUNCH_KEY = 'quickLaunch.v1';
const PERSONAL_CARD_KEY = 'personalCard.v1';
const CALENDAR_OFFSET_PREFIX = 'androidWidget.calendar.offset.';

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

async function readOffset(widgetId: number): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(`${CALENDAR_OFFSET_PREFIX}${widgetId}`);
    const n = raw === null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function writeOffset(widgetId: number, offset: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CALENDAR_OFFSET_PREFIX}${widgetId}`,
      String(offset)
    );
  } catch {
    // Saving failed. The widget still shows the month once.
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

function drawCalendar(props: WidgetTaskHandlerProps, offset: number) {
  const base = new Date();
  const shown = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  props.renderWidget(
    <CalendarWidget
      year={shown.getFullYear()}
      month={shown.getMonth()}
      today={offset === 0 ? base.getDate() : null}
      widthDp={widthInDp(props)}
    />
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    const name = props.widgetInfo.widgetName;
    const widgetId = props.widgetInfo.widgetId;

    if (props.widgetAction === 'WIDGET_CLICK') {
      const action = props.clickAction;

      if (action === 'LAUNCH_APP') {
        const data = props.clickActionData as
          | { packageName?: string }
          | undefined;
        if (data && typeof data.packageName === 'string') {
          await launchApp(data.packageName);
        }
        return;
      }

      if (name === 'PwCalendar') {
        let offset = await readOffset(widgetId);
        if (action === 'CAL_PREV') offset -= 1;
        else if (action === 'CAL_NEXT') offset += 1;
        else if (action === 'CAL_TODAY') offset = 0;
        else return;
        offset = Math.max(-240, Math.min(240, offset));
        await writeOffset(widgetId, offset);
        drawCalendar(props, offset);
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
      } else if (name === 'PwCalendar') {
        // A timed refresh returns to the current month. Adding or resizing
        // keeps whichever month you were viewing.
        const offset =
          props.widgetAction === 'WIDGET_UPDATE'
            ? 0
            : await readOffset(widgetId);
        if (props.widgetAction === 'WIDGET_UPDATE') {
          await writeOffset(widgetId, 0);
        }
        drawCalendar(props, offset);
      }
    }
  } catch {
    // A widget error must never crash the app.
  }
}
