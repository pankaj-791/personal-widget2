import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { AppInfo, iconUri, launchApp } from '../native/InstalledApps';
import { usePersistedState } from '../storage/storage';
import AppPickerModal from '../components/AppPickerModal';
import { SavedApp } from './PersonalCardWidget';

const MAX_APPS = 8;
const TILE = 56;

export default function QuickLaunchSection() {
  const t = useTheme();
  const [apps, setApps, loaded] = usePersistedState<SavedApp[]>(
    'quickLaunch.v1',
    []
  );
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState('');

  const open = async (app: SavedApp) => {
    const ok = await launchApp(app.packageName);
    setMessage(ok ? '' : `${app.label} is not available. Use Edit to remove it.`);
  };

  const add = (app: AppInfo) => {
    setPicking(false);
    if (apps.some((a) => a.packageName === app.packageName)) {
      setMessage(`${app.label} is already in the bar.`);
      return;
    }
    setApps([
      ...apps,
      { packageName: app.packageName, label: app.label, icon: app.icon },
    ]);
    setMessage('');
  };

  const remove = (index: number) => {
    setApps(apps.filter((_, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= apps.length) return;
    const next = [...apps];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setApps(next);
  };

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: t.text }]}>Quick Launch</Text>
          <Text style={[styles.sub, { color: t.textMuted }]}>
            Tap an icon to open the app.
          </Text>
        </View>
        <Pressable
          onPress={() => setEditing(!editing)}
          style={[styles.editButton, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.editText, { color: t.text }]}>
            {editing ? 'Done' : 'Edit'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.bar}>
        {loaded && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barContent}
          >
            {apps.map((app, index) => (
              <View key={app.packageName} style={styles.item}>
                <Pressable onPress={() => open(app)} style={styles.tile}>
                  <Image
                    source={{ uri: iconUri(app) }}
                    style={styles.icon}
                  />
                </Pressable>
                {editing && (
                  <View style={styles.controls}>
                    <Pressable
                      onPress={() => move(index, -1)}
                      hitSlop={6}
                      style={styles.control}
                    >
                      <Text style={styles.controlText}>‹</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => remove(index)}
                      hitSlop={6}
                      style={styles.control}
                    >
                      <Text style={styles.controlText}>×</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => move(index, 1)}
                      hitSlop={6}
                      style={styles.control}
                    >
                      <Text style={styles.controlText}>›</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            {apps.length < MAX_APPS && (
              <View style={styles.item}>
                <Pressable
                  onPress={() => setPicking(true)}
                  style={styles.tile}
                >
                  <Text style={styles.plus}>+</Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {apps.length === 0 && loaded && (
        <Text style={[styles.hint, { color: t.textMuted }]}>
          Tap + to add your first app.
        </Text>
      )}
      {message !== '' && (
        <Text style={[styles.message, { color: t.text }]}>{message}</Text>
      )}

      <AppPickerModal
        visible={picking}
        title="Add to Quick Launch"
        onClose={() => setPicking(false)}
        onSelect={add}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  editButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editText: { fontSize: 14, fontWeight: '600' },
  bar: {
    backgroundColor: '#000000',
    borderRadius: radius.card,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    minHeight: TILE + spacing.md * 2,
  },
  barContent: { paddingHorizontal: spacing.md, alignItems: 'flex-start' },
  item: { alignItems: 'center', marginRight: 10 },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 16,
    backgroundColor: '#1A1B1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { width: 38, height: 38, borderRadius: 10 },
  plus: { color: '#6B6C75', fontSize: 28, fontWeight: '300' },
  controls: { flexDirection: 'row', marginTop: 6 },
  control: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2A2B31',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  controlText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 13, marginTop: spacing.sm },
  message: { fontSize: 14, fontWeight: '600', marginTop: spacing.sm },
});
