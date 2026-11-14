import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing, useTheme } from '../theme/theme';

export type TabKey = 'home' | 'library' | 'creator' | 'settings';

export const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'library', label: 'Library', icon: '▦' },
  { key: 'creator', label: 'Creator', icon: '✦' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
];

type Props = {
  active: TabKey;
  onChange: (key: TabKey) => void;
};

export default function TabBar({ active, onChange }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: t.tabBar,
          borderColor: t.cardBorder,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={styles.item}
          >
            <View
              style={[
                styles.pill,
                isActive && { backgroundColor: t.accent },
              ]}
            >
              <Text
                style={[
                  styles.icon,
                  { color: isActive ? t.accentText : t.textMuted },
                ]}
              >
                {tab.icon}
              </Text>
            </View>
            <Text
              style={[
                styles.label,
                { color: isActive ? t.text : t.textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    width: 56,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  label: { fontSize: 11, marginTop: 4, fontWeight: '600' },
});
