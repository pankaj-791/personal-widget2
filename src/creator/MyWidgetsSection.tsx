import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import CustomWidgetView from './CustomWidgetView';
import { deleteWidget, loadWidgets } from './widgetStore';
import { CustomWidgetSpec } from './widgetSpec';

export default function MyWidgetsSection() {
  const t = useTheme();
  const [widgets, setWidgets] = useState<CustomWidgetSpec[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadWidgets().then((list) => {
      if (active) {
        setWidgets(list);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const remove = async (id: string) => {
    await deleteWidget(id);
    setWidgets((list) => list.filter((w) => w.id !== id));
    setConfirmId(null);
  };

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>My Widgets</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Widgets you created in the AI Creator.
      </Text>

      {loaded && widgets.length === 0 && (
        <Text style={[styles.empty, { color: t.textMuted }]}>
          Nothing here yet. Open the AI Creator tab, describe a widget and tap
          Save to Library.
        </Text>
      )}

      {widgets.map((w) => (
        <View key={w.id} style={styles.item}>
          <CustomWidgetView spec={w} />
          <View style={styles.itemFooter}>
            <Text
              numberOfLines={1}
              style={[styles.itemName, { color: t.text }]}
            >
              {w.name}
            </Text>
            {confirmId === w.id ? (
              <View style={styles.confirmRow}>
                <Pressable
                  onPress={() => setConfirmId(null)}
                  style={[styles.smallButton, { borderColor: t.cardBorder }]}
                >
                  <Text style={[styles.smallText, { color: t.text }]}>
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => remove(w.id)}
                  style={[styles.smallButton, styles.danger]}
                >
                  <Text style={[styles.smallText, styles.dangerText]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setConfirmId(w.id)}
                style={[styles.smallButton, { borderColor: t.cardBorder }]}
              >
                <Text style={[styles.smallText, { color: t.text }]}>
                  Delete
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
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
  empty: { fontSize: 14, marginTop: spacing.md },
  item: { marginTop: spacing.md },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  itemName: { flex: 1, fontSize: 15, fontWeight: '600', marginRight: 8 },
  confirmRow: { flexDirection: 'row', gap: 6 },
  smallButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  smallText: { fontSize: 13, fontWeight: '600' },
  danger: { backgroundColor: '#E5484D', borderColor: '#E5484D' },
  dangerText: { color: '#FFFFFF' },
});
