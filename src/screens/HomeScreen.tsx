import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import {
  AppInfo,
  getInstalledApps,
  iconUri,
  launchApp,
} from '../native/InstalledApps';

export default function HomeScreen() {
  const t = useTheme();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getInstalledApps().then((list) => {
      setApps(list);
      setLoading(false);
    });
  }, []);

  const open = async (app: AppInfo) => {
    const ok = await launchApp(app.packageName);
    setMessage(ok ? `Opened ${app.label}` : `Could not open ${app.label}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <Text style={[styles.title, { color: t.text }]}>Home</Text>
      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.cardBorder },
        ]}
      >
        <Text style={[styles.cardTitle, { color: t.text }]}>
          Test app launcher
        </Text>
        <Text style={[styles.cardSub, { color: t.textMuted }]}>
          {loading
            ? 'Loading apps...'
            : `${apps.length} apps found. Tap one to open it.`}
        </Text>
        {message !== '' && (
          <Text style={[styles.message, { color: t.text }]}>{message}</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={t.text} style={styles.loader} />
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.packageName}
          numColumns={4}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <Pressable style={styles.cell} onPress={() => open(item)}>
              <Image source={{ uri: iconUri(item) }} style={styles.icon} />
              <Text
                numberOfLines={1}
                style={[styles.appLabel, { color: t.text }]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      )}
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
  message: { fontSize: 14, fontWeight: '600', marginTop: spacing.sm },
  loader: { marginTop: spacing.lg },
  grid: { paddingTop: spacing.md, paddingBottom: spacing.lg },
  cell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  icon: { width: 52, height: 52, borderRadius: 12 },
  appLabel: { fontSize: 11, marginTop: 4, maxWidth: 70 },
});
