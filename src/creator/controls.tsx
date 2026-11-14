import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { COLOR_PRESETS } from './widgetSpec';

const HEX = /^#[0-9A-Fa-f]{6}$/;

type ChipProps = { label: string; active: boolean; onPress: () => void };

export function Chip({ label, active, onPress }: ChipProps) {
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
      <Text style={[styles.chipText, { color: active ? t.accentText : t.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

type StepperProps = {
  label: string;
  display: string;
  onMinus: () => void;
  onPlus: () => void;
};

export function Stepper({ label, display, onMinus, onPlus }: StepperProps) {
  const t = useTheme();
  return (
    <View style={styles.stepperRow}>
      <Text style={[styles.stepperLabel, { color: t.text }]}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          onPress={onMinus}
          style={[styles.stepButton, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.stepText, { color: t.text }]}>−</Text>
        </Pressable>
        <Text style={[styles.stepValue, { color: t.textMuted }]}>{display}</Text>
        <Pressable
          onPress={onPlus}
          style={[styles.stepButton, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.stepText, { color: t.text }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

type ColorRowProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
};

export function ColorRow({ label, value, onChange }: ColorRowProps) {
  const t = useTheme();
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const onType = (input: string) => {
    const withHash = input.startsWith('#') ? input : `#${input}`;
    setText(withHash);
    if (HEX.test(withHash)) onChange(withHash.toUpperCase());
  };

  return (
    <View>
      <Text style={[styles.label, { color: t.textMuted }]}>{label}</Text>
      <View style={styles.row}>
        {COLOR_PRESETS.map((c) => {
          const active = value.toUpperCase() === c;
          return (
            <Pressable
              key={c}
              onPress={() => onChange(c)}
              style={[
                styles.swatch,
                {
                  backgroundColor: c,
                  borderColor: active ? t.accent : t.cardBorder,
                  borderWidth: active ? 3 : 1,
                },
              ]}
            />
          );
        })}
      </View>
      <TextInput
        value={text}
        onChangeText={onType}
        maxLength={7}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="#RRGGBB"
        placeholderTextColor={t.textMuted}
        style={[
          styles.input,
          {
            color: t.text,
            borderColor: HEX.test(text) ? t.cardBorder : '#E5484D',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  swatch: { width: 40, height: 40, borderRadius: radius.small },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    marginTop: spacing.sm,
    width: 140,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepperLabel: { fontSize: 15, fontWeight: '500' },
  stepperControls: { flexDirection: 'row', alignItems: 'center' },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, fontWeight: '500' },
  stepValue: {
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
