import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import TicTacToe from './TicTacToe';
import TapGame from './TapGame';
import MemoryGame from './MemoryGame';
import SnakeGame from './SnakeGame';

type GameKey = 'tictactoe' | 'tap' | 'memory' | 'snake';

const GAMES: { key: GameKey; label: string }[] = [
  { key: 'tictactoe', label: 'Tic-Tac-Toe' },
  { key: 'tap', label: 'Tap' },
  { key: 'memory', label: 'Memory' },
  { key: 'snake', label: 'Snake' },
];

export default function GamesSection() {
  const t = useTheme();
  const [game, setGame] = useState<GameKey>('tictactoe');

  return (
    <View>
      <Text style={[styles.heading, { color: t.text }]}>Games</Text>
      <View style={styles.row}>
        {GAMES.map((g) => {
          const active = g.key === game;
          return (
            <Pressable
              key={g.key}
              onPress={() => setGame(g.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? t.accent : 'transparent',
                  borderColor: active ? t.accent : t.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? t.accentText : t.text },
                ]}
              >
                {g.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {game === 'tictactoe' && <TicTacToe />}
      {game === 'tap' && <TapGame />}
      {game === 'memory' && <MemoryGame />}
      {game === 'snake' && <SnakeGame />}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
});
