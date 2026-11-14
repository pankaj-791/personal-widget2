import { Component, ComponentType, ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';

type BoundaryProps = { children: ReactNode; onError: (msg: string) => void };
type BoundaryState = { failed: boolean };

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(
      error instanceof Error ? error.message : String(error)
    );
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function SafeImageSection() {
  const t = useTheme();
  const [Section, setSection] = useState<ComponentType | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    try {
      const mod = require('./ImageSection');
      setSection(() => mod.default as ComponentType);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (Section) {
    return (
      <View>
        <Boundary onError={setError}>
          <Section />
        </Boundary>
        {error !== '' && (
          <Text style={[styles.error, { color: t.text }]}>
            Photo tools failed: {error}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Photo</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Photo tools load on demand.
      </Text>
      <Pressable
        onPress={load}
        style={[styles.button, { backgroundColor: t.accent }]}
      >
        <Text style={[styles.buttonText, { color: t.accentText }]}>
          Load photo tools
        </Text>
      </Pressable>
      {error !== '' && (
        <Text style={[styles.error, { color: t.text }]}>
          Photo tools failed: {error}
        </Text>
      )}
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
  button: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  error: { fontSize: 13, marginTop: spacing.md },
});
