import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { Chip, ColorRow, Stepper } from './controls';
import { CustomWidgetSpec } from './widgetSpec';
import { Align, EXTRA_LIMITS, ExtraStyle, getExtra } from './extraStyle';

const ALIGNS: { key: Align; label: string }[] = [
  { key: 'left', label: 'Left' },
  { key: 'center', label: 'Center' },
  { key: 'right', label: 'Right' },
];

type Props = {
  spec: CustomWidgetSpec;
  onUpdate: (patch: Partial<CustomWidgetSpec>) => void;
};

export default function StylePanel({ spec, onUpdate }: Props) {
  const t = useTheme();
  const e = getExtra(spec);

  const set = (patch: Partial<ExtraStyle>) =>
    onUpdate({ extra: { ...e, ...patch } });

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Style and glass</Text>

      <Text style={[styles.label, { color: t.textMuted }]}>Glass effect</Text>
      <View style={styles.row}>
        <Chip label="Off" active={!e.glass} onPress={() => set({ glass: false })} />
        <Chip label="On" active={e.glass} onPress={() => set({ glass: true })} />
      </View>

      {e.glass ? (
        <View style={styles.block}>
          <Stepper
            label="Glass strength"
            display={`${e.glassStrength}%`}
            onMinus={() => set({ glassStrength: e.glassStrength - 5 })}
            onPlus={() => set({ glassStrength: e.glassStrength + 5 })}
          />
          <Text style={[styles.hint, { color: t.textMuted }]}>
            Lower is clearer glass. The preview backdrop shows the effect.
          </Text>
        </View>
      ) : (
        <View style={styles.block}>
          <Stepper
            label="Background opacity"
            display={`${e.opacity}%`}
            onMinus={() => set({ opacity: e.opacity - 10 })}
            onPlus={() => set({ opacity: e.opacity + 10 })}
          />
        </View>
      )}

      <Text style={[styles.label, { color: t.textMuted }]}>Border</Text>
      <Stepper
        label="Border width"
        display={`${e.borderWidth}`}
        onMinus={() => set({ borderWidth: e.borderWidth - 1 })}
        onPlus={() => set({ borderWidth: e.borderWidth + 1 })}
      />
      {e.borderWidth > 0 && (
        <ColorRow
          label="Border color"
          value={e.borderColor}
          onChange={(borderColor) => set({ borderColor })}
        />
      )}

      <Text style={[styles.label, { color: t.textMuted }]}>Shadows</Text>
      <View style={styles.row}>
        <Chip
          label={e.shadow ? 'Widget shadow: on' : 'Widget shadow: off'}
          active={e.shadow}
          onPress={() => set({ shadow: !e.shadow })}
        />
        <Chip
          label={e.textShadow ? 'Text shadow: on' : 'Text shadow: off'}
          active={e.textShadow}
          onPress={() => set({ textShadow: !e.textShadow })}
        />
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Text alignment</Text>
      <View style={styles.row}>
        {ALIGNS.map((a) => (
          <Chip
            key={a.key}
            label={a.label}
            active={e.align === a.key}
            onPress={() => set({ align: a.key })}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Text spacing</Text>
      <Stepper
        label="Letter spacing"
        display={`${e.letterSpacing}`}
        onMinus={() => set({ letterSpacing: e.letterSpacing - 1 })}
        onPlus={() => set({ letterSpacing: e.letterSpacing + 1 })}
      />
      <Text style={[styles.hint, { color: t.textMuted }]}>
        Range {EXTRA_LIMITS.letterSpacing.min} to {EXTRA_LIMITS.letterSpacing.max}.
      </Text>

      <Text
        onPress={() =>
          onUpdate({
            extra: undefined,
          })
        }
        style={[styles.reset, { color: t.textMuted }]}
      >
        Reset style options
      </Text>
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  block: { marginTop: spacing.sm },
  hint: { fontSize: 12, marginTop: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  reset: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
