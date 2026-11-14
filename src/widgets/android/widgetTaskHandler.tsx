import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { HelloWidget } from './HelloWidget';

const TAPS_KEY = 'androidWidget.hello.taps';

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

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    const name = props.widgetInfo.widgetName;
    if (name !== 'PwHello') return;

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
          props.renderWidget(<HelloWidget taps={taps} updatedAt={timeNow()} />);
        }
        break;
      }

      default:
        break;
    }
  } catch {
    // A widget error must never crash the app.
  }
}
