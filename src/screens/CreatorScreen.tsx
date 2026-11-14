import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { deleteStoredImage, pickAndStoreImage } from '../native/pickImage';
import CustomWidgetView from '../creator/CustomWidgetView';
import { saveWidget } from '../creator/widgetStore';
import {
  COLOR_PRESETS,
  CustomWidgetSpec,
  DEFAULT_SPEC,
  FONTS,
  LIMITS,
  WidgetKind,
  clampSpec,
  generateFromDescription,
} from '../creator/widgetSpec';

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

const HEX = /^#[0-9A-Fa-f]{6}$/;

function newSpec(): CustomWidgetSpec {
  return { ...DEFAULT_SPEC, id: `w-${Date.now()}` };
}

type ChipProps = { label: string; active: boolean; onPress: () => void };

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

function Stepper({ label, display, onMinus, onPlus }: StepperProps) {
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

function ColorRow({ label, value, onChange }: ColorRowProps) {
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
        {COLOR_PRESETS.map((c) => (
          <Pressable
            key={c}
            onPress={() => onChange(c)}
            style={[
              styles.swatch,
              {
                backgroundColor: c,
                borderColor: value.toUpperCase() === c ? t.accent : t.cardBorder,
                borderWidth: value.toUpperCase() === c ? 3 : 1,
              },
            ]}
          />
        ))}
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
          styles.hexInput,
          {
            color: t.text,
            borderColor: HEX.test(text) ? t.cardBorder : '#E5484D',
          },
        ]}
      />
    </View>
  );
}

export default function CreatorScreen() {
  const t = useTheme();
  const [description, setDescription] = useState('');
  const [spec, setSpec] = useState<CustomWidgetSpec>(newSpec);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (patch: Partial<CustomWidgetSpec>) =>
    setSpec((s) => clampSpec({ ...s, ...patch }));

  const generate = async () => {
    if (description.trim() === '') {
      setMessage('Describe a widget first.');
      return;
    }
    await deleteStoredImage(spec.imageUri);
    setSpec({ ...generateFromDescription(description), id: spec.id });
    setMessage('Generated. Adjust anything below, then save.');
  };

  const choosePhoto = async () => {
    if (busy) return;
    setBusy(true);
    const stored = await pickAndStoreImage(spec.id);
    if (stored) {
      await deleteStoredImage(spec.imageUri);
      update({ imageUri: stored });
    }
    setBusy(false);
  };

  const removePhoto = async () => {
    await deleteStoredImage(spec.imageUri);
    update({ imageUri: null });
  };

  const save = async () => {
    const ok = await saveWidget({
      ...spec,
      name: spec.name.trim() === '' ? 'Custom widget' : spec.name.trim(),
      description,
    });
    setMessage(
      ok
        ? 'Saved. You can find it in your Library.'
        : 'Your library is full (30 widgets). Delete one first.'
    );
  };

  const startNew = () => {
    setSpec(newSpec());
    setDescription('');
    setMessage('');
  };

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      stickyHeaderIndices={[2]}
    >
      <Text style={[styles.title, { color: t.text }]}>AI Widget Creator</Text>

      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.cardBorder },
        ]}
      >
        <Text style={[styles.cardTitle, { color: t.text }]}>
          Describe your widget
        </Text>
        <Text style={[styles.cardSub, { color: t.textMuted }]}>
          Example: minimal black digital clock with white numbers, rounded
          corners
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={300}
          placeholder="Describe the widget you want"
          placeholderTextColor={t.textMuted}
          style={[
            styles.input,
            styles.multiline,
            { color: t.text, borderColor: t.cardBorder },
          ]}
        />
        <Pressable
          onPress={generate}
          style={[styles.primary, { backgroundColor: t.accent }]}
        >
          <Text style={[styles.primaryText, { color: t.accentText }]}>
            Generate
          </Text>
        </Pressable>
        {message !== '' && (
          <Text style={[styles.message, { color: t.text }]}>{message}</Text>
        )}
      </View>

      <View style={[styles.previewWrap, { backgroundColor: t.background }]}>
        <CustomWidgetView spec={spec} />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: t.card, borderColor: t.cardBorder },
        ]}
      >
        <Text style={[styles.cardTitle, { color: t.text }]}>Customize</Text>

        <Text style={[styles.label, { color: t.textMuted }]}>Name</Text>
        <TextInput
          value={spec.name}
          onChangeText={(name) => setSpec((s) => ({ ...s, name }))}
          maxLength={24}
          placeholder="Widget name"
          placeholderTextColor={t.textMuted}
          style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
        />

        <Text style={[styles.label, { color: t.textMuted }]}>Type</Text>
        <View style={styles.row}>
          {KINDS.map((k) => (
            <Chip
              key={k.key}
              label={k.label}
              active={spec.kind === k.key}
              onPress={() => update({ kind: k.key })}
            />
          ))}
        </View>

        {spec.kind === 'text' && (
          <>
            <Text style={[styles.label, { color: t.textMuted }]}>Text</Text>
            <TextInput
              value={spec.text}
              onChangeText={(text) => setSpec((s) => ({ ...s, text }))}
              maxLength={40}
              placeholder="Your text"
              placeholderTextColor={t.textMuted}
              style={[
                styles.input,
                { color: t.text, borderColor: t.cardBorder },
              ]}
            />
          </>
        )}

        {spec.kind === 'clock' && (
          <>
            <Text style={[styles.label, { color: t.textMuted }]}>Format</Text>
            <View style={styles.row}>
              <Chip
                label="24-hour"
                active={!spec.hour12}
                onPress={() => update({ hour12: false })}
              />
              <Chip
                label="12-hour"
                active={spec.hour12}
                onPress={() => update({ hour12: true })}
              />
            </View>
            <Text style={[styles.label, { color: t.textMuted }]}>Date</Text>
            <View style={styles.row}>
              <Chip
                label="Show"
                active={spec.showDate}
                onPress={() => update({ showDate: true })}
              />
              <Chip
                label="Hide"
                active={!spec.showDate}
                onPress={() => update({ showDate: false })}
              />
            </View>
          </>
        )}

        <ColorRow
          label="Background"
          value={spec.backgroundColor}
          onChange={(backgroundColor) => update({ backgroundColor })}
        />
        <ColorRow
          label="Text color"
          value={spec.textColor}
          onChange={(textColor) => update({ textColor })}
        />

        <Text style={[styles.label, { color: t.textMuted }]}>Font</Text>
        <View style={styles.row}>
          {FONTS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={spec.font === f.key}
              onPress={() => update({ font: f.key })}
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
              onPress={() => update({ weight: w.key })}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>Shape and size</Text>
        <Stepper
          label="Corner radius"
          display={`${spec.borderRadius}`}
          onMinus={() => update({ borderRadius: spec.borderRadius - 4 })}
          onPlus={() => update({ borderRadius: spec.borderRadius + 4 })}
        />
        <Stepper
          label="Spacing"
          display={`${spec.padding}`}
          onMinus={() => update({ padding: spec.padding - 4 })}
          onPlus={() => update({ padding: spec.padding + 4 })}
        />
        <Stepper
          label="Width"
          display={`${spec.widthPct}%`}
          onMinus={() => update({ widthPct: spec.widthPct - 10 })}
          onPlus={() => update({ widthPct: spec.widthPct + 10 })}
        />
        <Stepper
          label="Height"
          display={`${spec.height}`}
          onMinus={() => update({ height: spec.height - 10 })}
          onPlus={() => update({ height: spec.height + 10 })}
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
              onPress={() => update({ icon: ic })}
            />
          ))}
        </View>

        <Text style={[styles.label, { color: t.textMuted }]}>
          Photo background
        </Text>
        <View style={styles.row}>
