import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';

type Test = { key: string; label: string; run: () => string };

const TESTS: Test[] = [
  {
    key: 'fs',
    label: '1. Test file storage',
    run: () => {
      const m = require('expo-file-system/legacy');
      return typeof m.copyAsync === 'function'
        ? 'OK: file storage loaded'
        : 'Loaded, but copyAsync is missing';
    },
  },
  {
    key: 'picker',
    label: '2. Test image picker',
    run: () => {
      const m = require('expo-image-picker');
      return typeof m.launchImageLibraryAsync === 'function'
        ? 'OK: image picker loaded'
        : 'Loaded, but launchImageLibraryAsync is missing';
    },
  },
  {
    key: 'skia',
    label: '3. Test Skia',
    run: () => {
      const m = require('@shopify/react-native-skia');
      return m.Canvas
        ? 'OK: Skia loaded'
        : 'Loaded, but Canvas is missing';
    },
  },
];

export default function SafeImageSection() {
  const t = useTheme();
  const [results, setResults] = useState<Record<string, string>>({});

  const runTest = (test: Test) => {
    setResults((r) => ({ ...r, [test.key]: 'Testing...' }));
    try {
      const outcome = test.run();
      setResults((r) => ({ ...r, [test.key]: outcome }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setResults((r) => ({ ...r, [test.key]: `FAILED: ${msg}` }));
    }
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Library test</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Tap the tests in order. If the app closes, tell me which number you
        tapped.
      </Text>
      {TESTS.map((test) => (
        <View key={test.key} style={styles.block}>
          <Pressable
            onPress={() => runTest(test)}
            style={[styles.button, { backgroundColor: t.accent }]}
          >
            <Text style={[styles.buttonText, { color: t.accentText }]}>
              {test.label}
            </Text>
          </Pressable>
          {results[test.key] !== undefined && (
            <Text style={[styles.result, { color: t.text }]}>
              {results[test.key]}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  block: { marginTop: spacing.md },
  button: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  result: { fontSize: 13, marginTop: spacing.sm },
});
