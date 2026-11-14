import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme/theme';
import PersonalCardSection from '../widgets/PersonalCardSection';
import QuickLaunchSection from '../widgets/QuickLaunchSection';
import SafeImageSection from '../widgets/SafeImageSection';

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
      <View style={styles.gap} />
      <QuickLaunchSection />
      <View style={styles.gap} />
      <SafeImageSection />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 34, fontWeight: '700', marginBottom: spacing.lg },
  gap: { height: spacing.lg },
});
