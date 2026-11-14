import { ScrollView, StyleSheet, Text } from 'react-native';
import { spacing, useTheme } from '../theme/theme';
import PersonalCardSection from '../widgets/PersonalCardSection';

export default function HomeScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: t.text }]}>Home</Text>
      <PersonalCardSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 34, fontWeight: '700', marginBottom: spacing.lg },
});
