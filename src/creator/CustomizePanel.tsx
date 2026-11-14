import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { deleteStoredImage, pickAndStoreImage } from '../native/pickImage';
import { Chip, ColorRow, Stepper } from './controls';
import {
  CustomWidgetSpec,
  FONTS,
  LIMITS,
  WidgetKind,
} from './widgetSpec';

const KINDS: { key: WidgetKind; label: string }[] = [
  { key: 'clock', label: 'Clock' },
  { key: 'date', label: 'Date' },
  { key: 'text', label: 'Text' },
];

const WEIGHTS: { key: CustomWidgetSpec['weight']; label: string }[] = [
  { key: '300', label: 'Light' },
  { key: '400', label: 'Regular' },
  { key: '700', label: 'Bold' },
  { key: '800', label: 'Heavy' },
];

const ICON_CHOICES: string[] = [
  '',
  '☀️',
  '🌙',
  '🎵',
  '❤️',
  '⭐',
  '🔥',
  '🚀',
  '☕',
  '🎮',
  '⏰',
  '🌸',
];

type Props = {
  spec: CustomWidgetSpec;
  onUpdate: (patch: Partial<CustomWidgetSpec>) => void;
};

export default function CustomizePanel({ spec, onUpdate }: Props) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);

  const choosePhoto = async () => {
    if (busy) return;
    setBusy(true);
    const stored = await pickAndStoreImage(spec.id);
    if (stored) {
      await deleteStoredImage(spec.imageUri);
      onUpdate({ imageUri: stored });
    }
    setBusy(false);
  };

  const removePhoto = async () => {
    await deleteStoredImage(spec.imageUri);
    onUpdate({ imageUri: null });
  };

  const inputStyle = [
    styles.input,
    { color: t.text, borderColor: t.cardBorder },
  ];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Customize</Text>

      <Text style={[styles.label, { color: t.textMuted }]}>Name</Text>
      <TextInput
        value={spec.name}
        onChangeText={(name) => onUpdate({ name })}
        maxLength={24}
        placeholder="Widget name"
        placeholderTextColor={t.textMuted}
        style={inputStyle}
      />

      <Text style={[styles.label, { color: t.textMuted }]}>Type</Text>
      <View style={styles.row}>
        {KINDS.map((k) => (
          <Chip
            key={k.key}
            label={k.label}
            active={spec.kind === k.key}
            onPress={() => onUpdate({ kind: k.key })}
          />
        ))}
      </View>

      {spec.kind === 'text' && (
        <View>
          <Text style={[styles.label, { color: t.textMuted }]}>Text</Text>
          <TextInput
            value={spec.text}
            onChangeText={(text) => onUpdate({ text })}
            maxLength={40}
            placeholder="Your text"
            placeholderTextColor={t.textMuted}
            style={inputStyle}
          />
        </View>
      )}

      {spec.kind === 'clock' && (
        <View>
          <Text style={[styles.label, { color: t.textMuted }]}>Format</Text>
          <View style={styles.row}>
            <Chip
              label="24-hour"
              active={!spec.hour12}
              onPress={() => onUpdate({ hour12: false })}
            />
            <Chip
              label="12-hour"
              active={spec.hour12}
              onPress={() => onUpdate({ hour12: true })}
            />
          </View>
          <Text style={[styles.label, { color: t.textMuted }]}>Date</Text>
          <View style={styles.row}>
            <Chip
              label="Show"
              active={spec.showDate}
              onPress={() => onUpdate({ showDate: true })}
            />
            <Chip
              label="Hide"
              active={!spec.showDate}
              onPress={() => onUpdate({ showDate: false })}
            />
          </View>
        </View>
      )}

      <ColorRow
        label="Background"
        value={spec.backgroundColor}
        onChange={(backgroundColor) => onUpdate({ backgroundColor })}
      />
      <ColorRow
        label="Text color"
        value={spec.textColor}
        onChange={(textColor) => onUpdate({ textColor })}
      />

      <Text style={[styles.label, { color: t.textMuted }]}>Font</Text>
      <View style={styles.row}>
        {FONTS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={spec.font === f.key}
            onPress={() => onUpdate({ font: f.key })}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Weight</Text>
      <View style={styles.row}>
        {WEIGHTS.map((w) => (
          <Chip
            key={w.key}
            label={w.label}
            active={spec.weight === w.key}
            onPress={() => onUpdate({ weight: w.key })}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Shape and size</Text>
      <Stepper
        label="Corner radius"
        display={`${spec.borderRadius}`}
        onMinus={() => onUpdate({ borderRadius: spec.borderRadius - 4 })}
        onPlus={() => onUpdate({ borderRadius: spec.borderRadius + 4 })}
      />
      <Stepper
        label="Spacing"
        display={`${spec.padding}`}
        onMinus={() => onUpdate({ padding: spec.padding - 4 })}
        onPlus={() => onUpdate({ padding: spec.padding + 4 })}
      />
      <Stepper
        label="Width"
        display={`${spec.widthPct}%`}
        onMinus={() => onUpdate({ widthPct: spec.widthPct - 10 })}
        onPlus={() => onUpdate({ widthPct: spec.widthPct + 10 })}
      />
      <Stepper
        label="Height"
        display={`${spec.height}`}
        onMinus={() => onUpdate({ height: spec.height - 10 })}
        onPlus={() => onUpdate({ height: spec.height + 10 })}
      />
      <Text style={[styles.hint, { color: t.textMuted }]}>
        Limits: corners {LIMITS.borderRadius.min} to {LIMITS.borderRadius.max},
        height {LIMITS.height.min} to {LIMITS.height.max}.
      </Text>

      <Text style={[styles.label, { color: t.textMuted }]}>Icon</Text>
      <View style={styles.row}>
        {ICON_CHOICES.map((ic) => (
          <Chip
            key={ic === '' ? 'none' : ic}
            label={ic === '' ? 'None' : ic}
            active={spec.icon === ic}
            onPress={() => onUpdate({ icon: ic })}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>
        Photo background
      </Text>
      <View style={styles.row}>
        <Chip
          label={busy ? 'Opening...' : spec.imageUri ? 'Change photo' : 'Add photo'}
          active={false}
          onPress={choosePhoto}
        />
        {spec.imageUri !== null && (
          <Chip label="Remove photo" active={false} onPress={removePhoto} />
        )}
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hint: { fontSize: 12, marginTop: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
});
