import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

const DURATION_MS = 10000;
const TICK_MS = 100;

type Phase = 'idle' | 'playing' | 'done';

export default function TapGame() {
  const t = useTheme();
  const [best, setBest, loaded] = usePersistedState<number>(
    'game.tap.best.v1',
    0
  );
  const [phase, setPhase] = useState<Phase>('idle');
  const [taps, setTaps] = useState(0);
  const [msLeft, setMsLeft] = useState(DURATION_MS);
  const [newBest, setNewBest] = useState(false);

  const tapsRef = useRef(0);
  const endAt = useRef(0);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  useEffect(() => stopTimer, []);

  const finish = () => {
    stopTimer();
    setMsLeft(0);
    setPhase('done');
    const final = tapsRef.current;
    if (final > best) {
      setBest(final);
      setNewBest(true);
    }
  };

  const start = () => {
    stopTimer();
    tapsRef.current = 0;
    setTaps(0);
    setNewBest(false);
    setMsLeft(DURATION_MS);
    endAt.current = Date.now() + DURATION_MS;
    setPhase('playing');
    interval.current = setInterval(() => {
      const left = endAt.current - Date.now();
      if (left <= 0) {
        finish();
      } else {
        setMsLeft(left);
      }
    }, TICK_MS);
  };

  const tap = () => {
    if (phase !== 'playing') return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
  };

  const seconds = (msLeft / 1000).toFixed(1);
  const progress = msLeft / DURATION_MS;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Tap Game</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        {loaded ? `Best: ${best}` : ' '}
      </Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: t.text }]}>{taps}</Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>Taps</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: t.text }]}>{seconds}s</Text>
          <Text style={[styles.statLabel, { color: t.textMuted }]}>Time</Text>
        </View>
      </View>

      <View style={[styles.track, { backgroundColor: t.cardBorder }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: t.accent, width: `${progress * 100}%` },
          ]}
        />
      </View>

      <Pressable
        onPressIn={tap}
        disabled={phase !== 'playing'}
        style={[
          styles.bigButton,
          { backgroundColor: phase === 'playing' ? '#7C9CFF' : '#23252C' },
        ]}
      >
        <Text style={styles.bigText}>
          {phase === 'idle'
            ? 'Press Start'
            : phase === 'playing'
            ? 'TAP!'
            : newBest
            ? `New best: ${taps}!`
            : `Final: ${taps}`}
        </Text>
      </Pressable>

      <View style={styles.buttons}>
        <Pressable
          onPress={start}
          style={[styles.button, { backgroundColor: t.accent }]}
        >
          <Text style={[styles.buttonText, { color: t.accentText }]}>
            {phase === 'playing'
              ? 'Restart'
              : phase === 'done'
              ? 'Play again'
              : 'Start'}
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
  stats: { flexDirection: 'row', marginTop: spacing.md },
  stat: { flex: 1 },
  statValue: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 2 },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  fill: { height: 8, borderRadius: 4 },
  bigButton: {
    height: 140,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  bigText: { color: '#000000', fontSize: 28, fontWeight: '800' },
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
