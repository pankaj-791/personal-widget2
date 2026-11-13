import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';

export default function LibraryScreen() {
  const t = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <Text style={[styles.title, { color: t.text }]}>Library</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.cardBorder },
        ]}
      >
        <Text style={[styles.cardTitle, { color: t.text }]}>
          Ready-made widgets
        </Text>
        <Text style={[styles.cardSub, { color: t.textMuted }]}>
          Clock, calendar, photos, games and more are coming in Phase 3.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: 34, fontWeight: '700', marginBottom: spacing.lg },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { fontSize: 14, marginTop: spacing.xs },
});
