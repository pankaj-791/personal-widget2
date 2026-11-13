import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '../theme/theme';
import { AppInfo, getInstalledApps, iconUri } from '../native/InstalledApps';

let cachedApps: AppInfo[] | null = null;

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (app: AppInfo) => void;
  onRemove?: () => void;
};

export default function AppPickerModal({
  visible,
  title = 'Choose an app',
  onClose,
  onSelect,
  onRemove,
}: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [apps, setApps] = useState<AppInfo[]>(cachedApps ?? []);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    if (cachedApps) {
      setApps(cachedApps);
      return;
    }
    setLoading(true);
    getInstalledApps().then((list) => {
      cachedApps = list;
      setApps(list);
      setLoading(false);
    });
  }, [visible]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === '') return apps;
    return apps.filter((a) => a.label.toLowerCase().includes(q));
  }, [apps, query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: t.card,
              borderColor: t.cardBorder,
              paddingBottom: Math.max(insets.bottom, spacing.md),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: t.text }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={[styles.close, { color: t.textMuted }]}>Cancel</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search apps"
            placeholderTextColor={t.textMuted}
            style={[
              styles.search,
              { color: t.text, borderColor: t.cardBorder },
            ]}
          />

          {onRemove && (
            <Pressable
              onPress={onRemove}
              style={[styles.removeButton, { borderColor: t.cardBorder }]}
            >
              <Text style={[styles.removeText, { color: t.text }]}>
                Remove current app
              </Text>
            </Pressable>
          )}

          {loading ? (
            <ActivityIndicator color={t.text} style={styles.loader} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.packageName}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={[styles.empty, { color: t.textMuted }]}>
                  No apps found
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => onSelect(item)}>
                  <Image
                    source={{ uri: iconUri(item) }}
                    style={styles.icon}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.label, { color: t.text }]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  backdropTap: { flex: 1 },
  sheet: {
    height: '80%',
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: { fontSize: 20, fontWeight: '700' },
  close: { fontSize: 15, fontWeight: '600' },
  search: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  removeText: { fontSize: 14, fontWeight: '600' },
  loader: { marginTop: spacing.lg },
  empty: { textAlign: 'center', marginTop: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  icon: { width: 44, height: 44, borderRadius: 10 },
  label: { fontSize: 16, marginLeft: spacing.md, flex: 1 },
});
