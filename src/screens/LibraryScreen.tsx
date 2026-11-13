import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import ClockWidget, {
  ClockConfig,
  ClockStyle,
  WidgetSize,
  defaultClockConfig,
} from '../widgets/ClockWidget';

const STYLES: { key: ClockStyle; label: string }[] = [
  { key: 'bold', label: 'Bold' },
  { key: 'minimal', label: 'Minimal' },
  { key: 'stacked', label: 'Stacked' },
];

const SIZES: { key: WidgetSize; label: string }[] = [
  { key: 'small', label: 'Small' },
  { key: 'medium', label: 'Medium' },
  { key: 'large', label: 'Large' },
];

const COLORS: { text: string; bg: string }[] = [
  { text: '#FFFFFF', bg: '#000000' },
  { text: '#000000', bg: '#FFFFFF' },
  { text: '#7C9CFF', bg: '#F5A623' },
  { text: '#FFD60A', bg: '#1A1B1F' },
];

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function Chip({ label, active, onPress }: ChipProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? t.accent : 'transparent',
          borderColor: active ? t.accent : t.cardBorder,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? t.accentText : t.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function LibraryScreen() {
  const t = useTheme();
  const [config, setConfig] = useState<ClockConfig>(defaultClockConfig);
  const [size, setSize] = useState<WidgetSize>('medium');

  const update = (patch: Partial<ClockConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: t.text }]}>Library</Text>

      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.cardBorder },
        ]}
      >
        <Text style={[styles.cardTitle, { color: t.text }]}>Clock</Text>
        <Text style={[styles.cardSub, { color: t.textMuted }]}>
          Try the styles below
        </Text>

        <View style={styles.preview}>
          <ClockWidget config={config} size={size} />
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Style</Text>
        <View style={styles.row}>
          {STYLES.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={config.style === s.key}
              onPress={() => update({ style: s.key })}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Format</Text>
        <View style={styles.row}>
          <Chip
            label="24-hour"
            active={!config.hour12}
            onPress={() => update({ hour12: false })}
          />
          <Chip
            label="12-hour"
            active={config.hour12}
            onPress={() => update({ hour12: true })}
          />
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Date</Text>
        <View style={styles.row}>
          <Chip
            label="Show"
            active={config.showDate}
            onPress={() => update({ showDate: true })}
          />
          <Chip
            label="Hide"
            active={!config.showDate}
            onPress={() => update({ showDate: false })}
          />
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Size</Text>
        <View style={styles.row}>
          {SIZES.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={size === s.key}
              onPress={() => setSize(s.key)}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Color</Text>
        <View style={styles.row}>
          {COLORS.map((c) => {
            const active =
              config.textColor === c.text && config.backgroundColor === c.bg;
            return (
              <Pressable
                key={c.text + c.bg}
                onPress={() =>
                  update({ textColor: c.text, backgroundColor: c.bg })
                }
                style={[
                  styles.swatch,
                  {
                    backgroundColor: c.bg,
                    borderColor: active ? t.accent : t.cardBorder,
                    borderWidth: active ? 3 : 1,
                  },
                ]}
              >
                <Text style={{ color: c.text, fontWeight: '700' }}>Aa</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  title: { fontSize: 34, fontWeight: '700', marginBottom: spacing.lg },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardSub: { fontSize: 14, marginTop: spacing.xs },
  preview: { marginVertical: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  swatch: {
    width: 52,
    height: 40,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
