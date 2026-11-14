import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { CalendarWidget } from './CalendarWidget';
import { readText, writeText } from './data';
import { widthInDp } from './widgetSize';

const OFFSET_PREFIX = 'androidWidget.calendar.offset.';

async function readOffset(widgetId: number): Promise<number> {
  const raw = await readText(`${OFFSET_PREFIX}${widgetId}`);
  const n = raw === null ? 0 : parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

function draw(props: WidgetTaskHandlerProps, offset: number) {
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

export async function handleCalendar(
  props: WidgetTaskHandlerProps
): Promise<void> {
  const id = props.widgetInfo.widgetId;

  if (props.widgetAction === 'WIDGET_CLICK') {
    let offset = await readOffset(id);
    const action = props.clickAction;
    if (action === 'CAL_PREV') offset -= 1;
    else if (action === 'CAL_NEXT') offset += 1;
    else if (action === 'CAL_TODAY') offset = 0;
    else return;
    offset = Math.max(-240, Math.min(240, offset));
    await writeText(`${OFFSET_PREFIX}${id}`, String(offset));
    draw(props, offset);
    return;
  }

  // A timed refresh returns to the current month. Adding or resizing keeps
  // whichever month you were viewing.
  const isTimed = props.widgetAction === 'WIDGET_UPDATE';
  const offset = isTimed ? 0 : await readOffset(id);
  if (isTimed) await writeText(`${OFFSET_PREFIX}${id}`, '0');
  draw(props, offset);
}
