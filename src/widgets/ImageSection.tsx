import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';
import { deleteStoredImage, pickAndStoreImage } from '../native/pickImage';
import ImageWidget, { ImageShape, SHAPES } from './ImageWidget';
import {
  Adjustments,
  FILTERS,
  FilterName,
  defaultAdjustments,
} from './imageFilters';

type ImageConfig = {
  uri: string | null;
  filter: FilterName;
  shape: ImageShape;
  adjustments: Adjustments;
};

const defaultConfig: ImageConfig = {
  uri: null,
  filter: 'original',
  shape: 'wide',
  adjustments: defaultAdjustments,
};

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

export default function ImageSection() {
  const t = useTheme();
  const [config, setConfig, loaded] = usePersistedState<ImageConfig>(
    'imageWidget.v1',
    defaultConfig
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const adj = config.adjustments ?? defaultAdjustments;

  const choosePhoto = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    const stored = await pickAndStoreImage('image-widget');
    if (stored) {
      await deleteStoredImage(config.uri);
      setConfig({ ...config, uri: stored });
    } else {
      setMessage('No photo was added.');
    }
    setBusy(false);
  };

  const setAdj = (patch: Partial<Adjustments>) =>
    setConfig({ ...config, adjustments: { ...adj, ...patch } });

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Photo</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Pick a photo, then choose a filter and style.
      </Text>

      <View style={styles.preview}>
        {loaded && (
          <ImageWidget
            uri={config.uri}
            filter={config.filter}
            adjustments={adj}
            shape={config.shape}
            onPress={choosePhoto}
          />
        )}
      </View>

      <Pressable
        onPress={choosePhoto}
        style={[styles.primary, { backgroundColor: t.accent }]}
      >
        <Text style={[styles.primaryText, { color: t.accentText }]}>
          {busy ? 'Opening...' : config.uri ? 'Change photo' : 'Choose photo'}
        </Text>
      </Pressable>
      {message !== '' && (
        <Text style={[styles.message, { color: t.textMuted }]}>{message}</Text>
      )}

      <Text style={[styles.label, { color: t.textMuted }]}>Filter</Text>
      <View style={styles.row}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={config.filter === f.key}
            onPress={() => setConfig({ ...config, filter: f.key })}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Adjust</Text>
      <Stepper
        label="Brightness"
        display={`${Math.round(adj.brightness * 100)}`}
        onMinus={() =>
          setAdj({ brightness: round(clamp(adj.brightness - 0.05, -0.3, 0.3)) })
        }
        onPlus={() =>
          setAdj({ brightness: round(clamp(adj.brightness + 0.05, -0.3, 0.3)) })
        }
      />
      <Stepper
        label="Contrast"
        display={`${Math.round(adj.contrast * 100)}%`}
        onMinus={() =>
          setAdj({ contrast: round(clamp(adj.contrast - 0.1, 0.6, 1.4)) })
        }
        onPlus={() =>
          setAdj({ contrast: round(clamp(adj.contrast + 0.1, 0.6, 1.4)) })
        }
      />
      <Stepper
        label="Saturation"
        display={`${Math.round(adj.saturation * 100)}%`}
        onMinus={() =>
          setAdj({ saturation: round(clamp(adj.saturation - 0.1, 0, 2)) })
        }
        onPlus={() =>
          setAdj({ saturation: round(clamp(adj.saturation + 0.1, 0, 2)) })
        }
      />
      <Pressable
        onPress={() => setAdj(defaultAdjustments)}
        style={styles.resetWrap}
      >
        <Text style={[styles.resetText, { color: t.textMuted }]}>
          Reset adjustments
        </Text>
      </Pressable>

      <Text style={[styles.label, { color: t.textMuted }]}>Style</Text>
      <View style={styles.row}>
        {SHAPES.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            active={config.shape === s.key}
            onPress={() => setConfig({ ...config, shape: s.key })}
          />
        ))}
      </View>
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
  preview: { marginVertical: spacing.md },
  primary: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryText: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 13, marginTop: spacing.sm },
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
  resetWrap: { alignSelf: 'flex-start', paddingVertical: 4 },
  resetText: { fontSize: 13, fontWeight: '600' },
});
