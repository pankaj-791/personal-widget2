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

type Card = { id: number; symbol: string; matched: boolean };

const SYMBOLS = ['🍎', '🚀', '🎧', '🌙', '🔥', '🐱'];
const COLUMNS = 4;
const GAP = 8;
const MAX_BOARD = 340;

function makeDeck(): Card[] {
  const cards: Card[] = [];
  SYMBOLS.forEach((symbol, i) => {
    cards.push({ id: i * 2, symbol, matched: false });
    cards.push({ id: i * 2 + 1, symbol, matched: false });
  });
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }
  return cards;
}

export default function MemoryGame() {
  const t = useTheme();
  const [best, setBest, loaded] = usePersistedState<number>(
    'game.memory.best.v1',
    0
  );
  const [cards, setCards] = useState<Card[]>(makeDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const [newBest, setNewBest] = useState(false);
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

  const press = (index: number) => {
    if (locked || won) return;
    if (cards[index].matched || flipped.includes(index)) return;

    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
    if (nextFlipped.length < 2) return;

    const newMoves = moves + 1;
    setMoves(newMoves);
    const [a, b] = nextFlipped;

    if (cards[a].symbol === cards[b].symbol) {
      const nextCards = cards.map((c, i) =>
        i === a || i === b ? { ...c, matched: true } : c
      );
      setCards(nextCards);
      setFlipped([]);
      if (nextCards.every((c) => c.matched)) {
        setWon(true);
        if (best === 0 || newMoves < best) {
          setBest(newMoves);
          setNewBest(true);
        }
      }
    } else {
      setLocked(true);
      timer.current = setTimeout(() => {
        setFlipped([]);
        setLocked(false);
      }, 800);
    }
  };

  const newGame = () => {
    if (timer.current) clearTimeout(timer.current);
    setCards(makeDeck());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setWon(false);
    setNewBest(false);
  };

  const boardSize = Math.min(width, MAX_BOARD);
  const cellSize = (boardSize - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Memory Match</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        {loaded
          ? `Moves: ${moves}  ·  Best: ${best === 0 ? '-' : best}`
          : ' '}
      </Text>

      {won && (
        <Text style={[styles.status, { color: t.text }]}>
          {newBest
            ? `New best: ${moves} moves!`
            : `Done in ${moves} moves!`}
        </Text>
      )}

      <View onLayout={onLayout} style={styles.boardWrap}>
        <View style={[styles.board, { width: boardSize }]}>
          {cards.map((card, index) => {
            const faceUp = card.matched || flipped.includes(index);
            return (
              <Pressable
                key={card.id}
                onPress={() => press(index)}
                style={[
                  styles.card,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: card.matched
                      ? '#1F3A2A'
                      : faceUp
                      ? '#2A2B31'
                      : '#000000',
                  },
                ]}
              >
                <Text style={[styles.symbol, { fontSize: cellSize * 0.5 }]}>
                  {faceUp ? card.symbol : ''}
                </Text>
                {!faceUp && (
                  <Text style={[styles.back, { fontSize: cellSize * 0.4 }]}>
                    ?
                  </Text>
                )}
              </Pressable>
            );
          })}
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
  board: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  card: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { includeFontPadding: false },
  back: {
    position: 'absolute',
    color: '#3A3B42',
    fontWeight: '700',
    includeFontPadding: false,
  },
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
