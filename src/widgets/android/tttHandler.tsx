import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { readText, writeText } from './data';
import { TicTacToeWidget } from './TicTacToeWidget';
import { applyTap, parseState } from './tictactoeLogic';
import { heightInDp, widthInDp } from './widgetSize';

const STATE_KEY = 'androidWidget.ttt.v1';

export async function handleTicTacToe(
  props: WidgetTaskHandlerProps
): Promise<void> {
  let state = parseState(await readText(STATE_KEY));

  if (props.widgetAction === 'WIDGET_CLICK') {
    if (props.clickAction !== 'TTT_CELL') return;
    const data = props.clickActionData as { index?: number } | undefined;
    if (!data || typeof data.index !== 'number') return;
    state = applyTap(state, data.index);
    await writeText(STATE_KEY, JSON.stringify(state));
  }

  props.renderWidget(
    <TicTacToeWidget
      state={state}
      widthDp={widthInDp(props)}
      heightDp={heightInDp(props)}
    />
  );
}
