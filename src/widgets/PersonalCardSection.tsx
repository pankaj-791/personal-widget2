import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { AppInfo, launchApp } from '../native/InstalledApps';
import { usePersistedState } from '../storage/storage';
import AppPickerModal from '../components/AppPickerModal';
import PersonalCardWidget, {
  PersonalCardConfig,
  defaultPersonalCard,
} from './PersonalCardWidget';

export default function PersonalCardSection() {
  const t = useTheme();
  const [config, setConfig, loaded] = usePersistedState<PersonalCardConfig>(
    'personalCard.v1',
    defaultPersonalCard
  );
  const [picking, setPicking] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const slots = [0, 1, 2, 3].map((i) => config.slots?.[i] ?? null);
  const card: PersonalCardConfig = { ...config, slots };

  const setSlot = (index: number, app: AppInfo | null) => {
    const next = [...slots];
    next[index] = app
      ? { packageName: app.packageName, label: app.label, icon: app.icon }
      : null;
    setConfig({ ...card, slots: next });
    setPicking(null);
    setMessage('');
  };

  const onSlotPress = async (index: number) => {
    const slot = slots[index];
    if (!slot) {
      setPicking(index);
      return;
    }
    const ok = await launchApp(slot.packageName);
    setMessage(
      ok ? '' : `${slot.label} is not available. Hold the slot to change it.`
    );
  };

  const onSlotLongPress = (index: number) => setPicking(index);

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Personal Card</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Tap + to add an app. Tap an app to open it. Hold a slot to change or
        remove it.
      </Text>

      <View style={styles.preview}>
        {loaded ? (
          <PersonalCardWidget
            config={card}
            onSlotPress={onSlotPress}
            onSlotLongPress={onSlotLongPress}
          />
        ) : null}
      </View>

      {message !== '' && (
        <Text style={[styles.message, { color: t.text }]}>{message}</Text>
      )}

      <Text style={[styles.label, { color: t.textMuted }]}>Name</Text>
      <TextInput
        value={config.name}
        onChangeText={(name) => setConfig({ ...card, name })}
        maxLength={24}
        placeholder="Your name"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
      />

      <Text style={[styles.label, { color: t.textMuted }]}>Tagline</Text>
      <TextInput
        value={config.tagline}
        onChangeText={(tagline) => setConfig({ ...card, tagline })}
        maxLength={32}
        placeholder="Your tagline"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
      />

      <AppPickerModal
        visible={picking !== null}
        title={picking !== null ? `Slot ${picking + 1}` : 'Choose an app'}
        onClose={() => setPicking(null)}
        onSelect={(app) => {
          if (picking !== null) setSlot(picking, app);
        }}
        onRemove={
          picking !== null && slots[picking]
            ? () => setSlot(picking, null)
            : undefined
        }
      />
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
  preview: { marginVertical: spacing.md, minHeight: 120 },
  message: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
});
