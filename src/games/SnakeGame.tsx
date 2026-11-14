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

type Pt = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';
type Phase = 'idle' | 'playing' | 'over';
type GameState = {
  snake: Pt[];
  dir: Dir;
  queued: Dir;
  food: Pt;
  score: number;
};

const GRID = 14;
const TICK_MS = 150;
const MAX_BOARD = 336;

const VECTORS: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

function randomFood(snake: Pt[]): Pt {
  const free: Pt[] = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (!snake.some((s) => s.x === x && s.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

function initialState(): GameState {
  const snake = [
    { x: 4, y: 7 },
    { x: 3, y: 7 },
    { x: 2, y: 7 },
  ];
  return { snake, dir: 'right', queued: 'right', food: randomFood(snake), score: 0 };
}

export default function SnakeGame() {
  const t = useTheme();
  const [best, setBest, loaded] = usePersistedState<number>(
    'game.snake.best.v1',
    0
  );
  const [phase, setPhase] = useState<Phase>('idle');
  const [, setVersion] = useState(0);
  const [width, setWidth] = useState(300);
  const [newBest, setNewBest] = useState(false);

  const game = useRef<GameState>(initialState());
  const bestRef = useRef(best);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  bestRef.current = best;

  const stopTimer = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const rerender = () => setVersion((v) => v + 1);

  const endGame = () => {
    stopTimer();
    setPhase('over');
    if (game.current.score > bestRef.current) {
      setBest(game.current.score);
      setNewBest(true);
    }
    rerender();
  };

  const tick = () => {
    const g = game.current;
    g.dir = g.queued;
    const v = VECTORS[g.dir];
    const head = { x: g.snake[0].x + v.x, y: g.snake[0].y + v.y };

    if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
      endGame();
      return;
    }

    const eating = head.x === g.food.x && head.y === g.food.y;
    const body = eating ? g.snake : g.snake.slice(0, -1);
    if (body.some((s) => s.x === head.x && s.y === head.y)) {
      endGame();
      return;
    }

    const next = [head, ...g.snake];
    if (!eating) next.pop();
    g.snake = next;

    if (eating) {
      g.score += 1;
      if (next.length >= GRID * GRID) {
        endGame();
        return;
      }
      g.food = randomFood(next);
    }
    rerender();
  };

  const start = () => {
    stopTimer();
    game.current = initialState();
    setNewBest(false);
    setPhase('playing');
    rerender();
    interval.current = setInterval(tick, TICK_MS);
  };

  const steer = (d: Dir) => {
    if (phase !== 'playing') return;
    const g = game.current;
    if (d !== OPPOSITE[g.dir]) g.queued = d;
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const cell = Math.floor(Math.min(width, MAX_BOARD) / GRID);
  const boardPx = cell * GRID;
  const g = game.current;

  const arrow = (label: string, d: Dir) => (
    <Pressable
      onPressIn={() => steer(d)}
      style={[
        styles.arrow,
        { backgroundColor: '#000000', opacity: phase === 'playing' ? 1 : 0.5 },
      ]}
    >
      <Text style={styles.arrowText}>{label}</Text>
    </Pressable>
  );

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Snake</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        {loaded ? `Score: ${g.score}  ·  Best: ${best}` : ' '}
      </Text>

      {phase === 'over' && (
        <Text style={[styles.status, { color: t.text }]}>
          {newBest ? `New best: ${g.score}!` : `Game over: ${g.score}`}
        </Text>
      )}

      <View onLayout={onLayout} style={styles.boardWrap}>
        <View style={[styles.board, { width: boardPx, height: boardPx }]}>
          {g.snake.map((s, i) => (
            <View
              key={`${s.x}-${s.y}-${i}`}
              style={{
                position: 'absolute',
                left: s.x * cell + 1,
                top: s.y * cell + 1,
                width: cell - 2,
                height: cell - 2,
                borderRadius: 5,
                backgroundColor: i === 0 ? '#FFFFFF' : '#7C9CFF',
              }}
            />
          ))}
          <View
            style={{
              position: 'absolute',
              left: g.food.x * cell + 2,
              top: g.food.y * cell + 2,
              width: cell - 4,
              height: cell - 4,
              borderRadius: cell,
              backgroundColor: '#FF5A5F',
            }}
          />
        </View>
      </View>

      <View style={styles.pad}>
        <View style={styles.padRow}>{arrow('▲', 'up')}</View>
        <View style={styles.padRow}>
          {arrow('◀', 'left')}
          {arrow('▼', 'down')}
          {arrow('▶', 'right')}
        </View>
      </View>

      <View style={styles.buttons}>
        <Pressable
          onPress={start}
          style={[styles.button, { backgroundColor: t.accent }]}
        >
          <Text style={[styles.buttonText, { color: t.accentText }]}>
            {phase === 'idle'
              ? 'Start'
              : phase === 'playing'
              ? 'Restart'
              : 'Play again'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setBest(0)}
          style={[styles.button, styles.ghost, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.buttonText, { color: t.text }]}>
            Reset best
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
  status: { fontSize: 16, fontWeight: '700', marginTop: spacing.md },
  boardWrap: { alignItems: 'center', marginTop: spacing.md },
  board: {
    backgroundColor: '#000000',
    borderRadius: 20,
    overflow: 'hidden',
  },
  pad: { alignItems: 'center', marginTop: spacing.md, gap: 8 },
  padRow: { flexDirection: 'row', gap: 8 },
  arrow: {
    width: 72,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#FFFFFF', fontSize: 22 },
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
