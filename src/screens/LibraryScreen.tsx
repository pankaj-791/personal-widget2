import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { spacing, useTheme } from '../theme/theme';
import ErrorBoundary from '../components/ErrorBoundary';
import MyWidgetsSection from '../creator/MyWidgetsSection';
import ClockSection from '../widgets/ClockSection';
import CalendarSection from '../widgets/CalendarSection';
import GamesSection from '../games/GamesSection';
import ToolsSection from '../tools/ToolsSection';

export default function LibraryScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: t.text }]}>Library</Text>

      <ErrorBoundary name="My Widgets">
        <MyWidgetsSection />
      </ErrorBoundary>
      <View style={styles.gap} />

      <ErrorBoundary name="Clock">
        <ClockSection />
      </ErrorBoundary>
      <View style={styles.gap} />

      <ErrorBoundary name="Calendar">
        <CalendarSection />
      </ErrorBoundary>
      <View style={styles.gap} />

      <ErrorBoundary name="Games">
        <GamesSection />
      </ErrorBoundary>
      <View style={styles.gap} />

      <ErrorBoundary name="Tools">
        <ToolsSection />
      </ErrorBoundary>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 34, fontWeight: '700', marginBottom: spacing.lg },
  gap: { height: spacing.lg },
});
