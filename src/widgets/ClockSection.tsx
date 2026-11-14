import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { Chip } from '../creator/controls';
import ClockWidget, {
  ClockConfig,
  ClockStyle,
  WidgetSize,
  defaultClockConfig,
} from './ClockWidget';

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

export default function ClockSection() {
  const t = useTheme();
  const [config, setConfig] = useState<ClockConfig>(defaultClockConfig);
  const [size, setSize] = useState<WidgetSize>('medium');

  const update = (patch: Partial<ClockConfig>) =>
    setConfig((c) => ({ ...c, ...patch }));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Clock</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing.lg,
  },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 14, marginTop: spacing.xs },
  preview: { marginVertical: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 52,
    height: 40,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
