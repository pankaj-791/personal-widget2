import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { launchApp } from '../../native/InstalledApps';
import { readPersonalCard, readQuickLaunch } from './data';
import { QuickLaunchWidget } from './QuickLaunchWidget';
import { PersonalCardWidget } from './PersonalCardWidget';
import { DateWidget } from './DateWidget';
import { handleCalendar } from './calendarHandler';
import { handleTicTacToe } from './tttHandler';
import { heightInDp, widthInDp } from './widgetSize';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  try {
    const name = props.widgetInfo.widgetName;

    // Tapping an app icon on any widget launches that app.
    if (
      props.widgetAction === 'WIDGET_CLICK' &&
      props.clickAction === 'LAUNCH_APP'
    ) {
      const data = props.clickActionData as
        | { packageName?: string }
        | undefined;
      if (data && typeof data.packageName === 'string') {
        await launchApp(data.packageName);
      }
      return;
    }

    if (name === 'PwCalendar') {
      await handleCalendar(props);
      return;
    }

    if (name === 'PwTicTacToe') {
      await handleTicTacToe(props);
      return;
    }

    // The remaining widgets only need to be drawn. Taps on them are handled
    // by the system (they open the app).
    if (props.widgetAction === 'WIDGET_CLICK') return;

    if (name === 'PwQuickLaunch') {
      const apps = await readQuickLaunch();
      props.renderWidget(
        <QuickLaunchWidget apps={apps} widthDp={widthInDp(props)} />
      );
    } else if (name === 'PwPersonalCard') {
      const card = await readPersonalCard();
      props.renderWidget(<PersonalCardWidget card={card} />);
    } else if (name === 'PwDate') {
      props.renderWidget(
        <DateWidget now={new Date()} heightDp={heightInDp(props)} />
      );
    }
  } catch {
    // A widget error must never crash the app.
  }
}
