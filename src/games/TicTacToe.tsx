import { useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

type Cell = 'X' | 'O' | null;
type Result = 'win' | 'loss' | 'draw' | null;
type Score = { wins: number; losses: number; draws: number };

const GAP = 8;
const MAX_BOARD = 320;
const EMPTY: Cell[] = [null, null, null, null, null, null, null, null, null];
const NO_SCORE: Score = { wins: 0, losses: 0, draws: 0 };

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function findLineMove(board: Cell[], mark: Cell): number {
  for (const line of LINES) {
    const marks = line.filter((i) => board[i] === mark).length;
    const empty = line.filter((i) => board[i] === null);
    if (marks === 2 && empty.length === 1) return empty[0];
  }
  return -1;
}

function computerMove(board: Cell[]): number {
  let move = findLineMove(board, 'O');
  if (move >= 0) return move;
  move = findLineMove(board, 'X');
  if (move >= 0) return move;
  if (board[4] === null) return 4;
  const free: number[] = [];
  board.forEach((c, i) => {
    if (c === null) free.push(i);
  });
  return free[Math.floor(Math.random() * free.length)];
}

export default function TicTacToe() {
  const t = useTheme();
  const [score, setScore, loaded] = usePersistedState<Score>(
    'game.tictactoe.v1',
    NO_SCORE
  );
  const [board, setBoard] = useState<Cell[]>(EMPTY);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [width, setWidth] = useState(300);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const finish = (finalBoard: Cell[]) => {
    const w = winnerOf(finalBoard);
    const r: Result = w === 'X' ? 'win' : w === 'O' ? 'loss' : 'draw';
    setBoard(finalBoard);
    setLocked(false);
    setResult(r);
    setScore({
      wins: score.wins + (r === 'win' ? 1 : 0),
      losses: score.losses + (r === 'loss' ? 1 : 0),
      draws: score.draws + (r === 'draw' ? 1 : 0),
    });
  };

  const play = (index: number) => {
    if (locked || result || board[index]) return;
    const next = [...board];
    next[index] = 'X';
    if (winnerOf(next) || next.every((c) => c !== null)) {
      finish(next);
      return;
    }
    setBoard(next);
    setLocked(true);
    timer.current = setTimeout(() => {
      const move = computerMove(next);
      const after = [...next];
      after[move] = 'O';
      if (winnerOf(after) || after.every((c) => c !== null)) {
        finish(after);
      } else {
        setBoard(after);
        setLocked(false);
      }
    }, 350);
  };

  const newGame = () => {
    if (timer.current) clearTimeout(timer.current);
    setBoard(EMPTY);
    setLocked(false);
    setResult(null);
  };

  const boardSize = Math.min(width, MAX_BOARD);
  const cellSize = (boardSize - GAP * 2) / 3;

  const status =
    result === 'win'
      ? 'You won!'
      : result === 'loss'
      ? 'Computer won'
      : result === 'draw'
      ? "It's a draw"
      : locked
      ? 'Computer is thinking...'
      : 'Your turn (X)';

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Tic-Tac-Toe</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        {loaded
          ? `Wins ${score.wins}  ·  Losses ${score.losses}  ·  Draws ${score.draws}`
          : ' '}
      </Text>

      <Text style={[styles.status, { color: t.text }]}>{status}</Text>

      <View onLayout={onLayout} style={styles.boardWrap}>
        <View style={[styles.board, { width: boardSize }]}>
          {board.map((cell, index) => (
            <Pressable
              key={index}
              onPress={() => play(index)}
              style={[
                styles.cell,
                {
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: '#000000',
                },
              ]}
            >
              <Text
                style={[
                  styles.mark,
                  {
                    fontSize: cellSize * 0.55,
                    color: cell === 'X' ? '#FFFFFF' : '#7C9CFF',
                  },
                ]}
              >
                {cell ?? ''}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={newGame}
          style={[styles.button, { backgroundColor: t.accent }]}
        >
          <Text style={[styles.buttonText, { color: t.accentText }]}>
            New game
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setScore(NO_SCORE)}
          style={[styles.button, styles.ghost, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.buttonText, { color: t.text }]}>
            Reset score
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  status: { fontSize: 16, fontWeight: '600', marginTop: spacing.md },
  boardWrap: { alignItems: 'center', marginTop: spacing.md },
  board: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { fontWeight: '800', includeFontPadding: false },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  button: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghost: { borderWidth: 1, backgroundColor: 'transparent' },
  buttonText: { fontSize: 14, fontWeight: '700' },
});
