import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

type RawInfo = {
  width?: number;
  height?: number;
  screenInfo?: { density?: number };
};

function density(info: RawInfo): number {
  const d = info.screenInfo?.density;
  return typeof d === 'number' && d > 0 ? d : 2.75;
}

export function widthInDp(props: WidgetTaskHandlerProps): number {
  try {
    const info = props.widgetInfo as unknown as RawInfo;
    const w = typeof info.width === 'number' ? info.width : 0;
    if (w <= 0) return 300;
    return w > 700 ? w / density(info) : w;
  } catch {
    return 300;
  }
}

export function heightInDp(props: WidgetTaskHandlerProps): number {
  try {
    const info = props.widgetInfo as unknown as RawInfo;
    const h = typeof info.height === 'number' ? info.height : 0;
    if (h <= 0) return 150;
    return h > 900 ? h / density(info) : h;
  } catch {
    return 150;
  }
}
