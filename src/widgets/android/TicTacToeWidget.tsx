import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { TttState } from './tictactoeLogic';

type Props = {
  state: TttState;
  widthDp: number;
  heightDp: number;
};

const GAP = 6;
const PAD = 12;
const HEADER = 44;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function statusText(state: TttState): string {
  switch (state.outcome) {
    case 'win':
      return 'You won! Tap to play again';
    case 'loss':
      return 'Computer won. Tap to retry';
    case 'draw':
      return 'Draw. Tap to play again';
    default:
      return 'Your turn (X)';
  }
}

export function TicTacToeWidget({ state, widthDp, heightDp }: Props) {
  const avail = Math.min(widthDp - PAD * 2, heightDp - PAD * 2 - HEADER);
  const cell = clamp(Math.floor((avail - GAP * 2) / 3), 28, 90);
  const markFont = Math.floor(cell * 0.55);
  const rows = [0, 1, 2];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        borderRadius: 28,
        padding: PAD,
      }}
    >
      <FlexWidget
        style={{
          height: HEADER,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text={statusText(state)}
          style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' }}
        />
        <TextWidget
          text={`Wins ${state.wins}  Losses ${state.losses}  Draws ${state.draws}`}
          style={{ fontSize: 11, color: '#9A9BA3' }}
        />
      </FlexWidget>

      {rows.map((row) => (
        <FlexWidget
          key={row}
          style={{
            flexDirection: 'row',
            marginBottom: row < 2 ? GAP : 0,
          }}
        >
          {[0, 1, 2].map((col) => {
            const index = row * 3 + col;
            const mark = state.board[index];
            return (
              <FlexWidget
                key={index}
                clickAction="TTT_CELL"
                clickActionData={{ index }}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 14,
                  backgroundColor: '#1A1B1F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: col < 2 ? GAP : 0,
                }}
              >
                <TextWidget
                  text={mark}
                  style={{
                    fontSize: markFont,
                    color: mark === 'X' ? '#FFFFFF' : '#7C9CFF',
                    fontWeight: 'bold',
                  }}
                />
              </FlexWidget>
            );
          })}
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}
