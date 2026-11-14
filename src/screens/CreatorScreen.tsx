import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { deleteStoredImage } from '../native/pickImage';
import CustomWidgetView from '../creator/CustomWidgetView';
import CustomizePanel from '../creator/CustomizePanel';
import StylePanel from '../creator/StylePanel';
import { getExtra } from '../creator/extraStyle';
import { saveWidget } from '../creator/widgetStore';
import {
  CustomWidgetSpec,
  DEFAULT_SPEC,
  clampSpec,
  generateFromDescription,
} from '../creator/widgetSpec';

function newSpec(): CustomWidgetSpec {
  return { ...DEFAULT_SPEC, id: `w-${Date.now()}` };
}

export default function CreatorScreen() {
  const t = useTheme();
  const [description, setDescription] = useState('');
  const [spec, setSpec] = useState<CustomWidgetSpec>(newSpec);
  const [message, setMessage] = useState('');

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

  const save = async () => {
    const name = spec.name.trim() === '' ? 'Custom widget' : spec.name.trim();
    const ok = await saveWidget({ ...spec, name, description });
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
      <Text style={[styles.title, { color: t.text }]}>Widget Creator</Text>

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
        {getExtra(spec).glass && (
          <View style={styles.backdrop} pointerEvents="none">
            <View style={[styles.blob, styles.blobA]} />
            <View style={[styles.blob, styles.blobB]} />
            <View style={[styles.blob, styles.blobC]} />
          </View>
        )}
        <CustomWidgetView spec={spec} />
      </View>

      <CustomizePanel spec={spec} onUpdate={update} />
            <View style={{ height: spacing.lg }} />
      <StylePanel spec={spec} onUpdate={update} />

      <Pressable
        onPress={save}
        style={[styles.primary, styles.saveButton, { backgroundColor: t.accent }]}
      >
        <Text style={[styles.primaryText, { color: t.accentText }]}>
          Save to Library
        </Text>
      </Pressable>
      <Pressable onPress={startNew} style={styles.newWrap}>
        <Text style={[styles.newText, { color: t.textMuted }]}>
          Start a new widget
        </Text>
      </Pressable>
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
  previewWrap: { paddingVertical: spacing.md },
    backdrop: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobA: {
    width: 140,
    height: 140,
    left: 10,
    top: -20,
    backgroundColor: '#FF5A5F',
  },
  blobB: {
    width: 160,
    height: 160,
    right: 0,
    top: 30,
    backgroundColor: '#3B82F6',
  },
  blobC: {
    width: 120,
    height: 120,
    left: '40%',
    bottom: -30,
    backgroundColor: '#FFD60A',
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: spacing.md,
  },
  primary: {
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButton: { marginTop: spacing.lg },
  primaryText: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 14, fontWeight: '600', marginTop: spacing.md },
  newWrap: { alignSelf: 'center', paddingVertical: spacing.md },
  newText: { fontSize: 13, fontWeight: '600' },
});
