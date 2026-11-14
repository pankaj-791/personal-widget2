import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

type Note = { text: string; color: string };

const MAX_LENGTH = 500;
const COLORS = ['#FFE066', '#FFB3C7', '#A5D8FF', '#B2F2BB'];
const DEFAULT_NOTE: Note = { text: '', color: COLORS[0] };

export default function StickyNote() {
  const t = useTheme();
  const [note, setNote, loaded] = usePersistedState<Note>(
    'tool.note.v1',
    DEFAULT_NOTE
  );

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Sticky note</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Saves automatically as you type.
      </Text>

      <View style={[styles.paper, { backgroundColor: note.color }]}>
        <TextInput
          value={loaded ? note.text : ''}
          onChangeText={(text) => setNote({ ...note, text })}
          multiline
          maxLength={MAX_LENGTH}
          placeholder="Write something..."
          placeholderTextColor="rgba(0,0,0,0.45)"
          style={styles.noteInput}
        />
        <Text style={styles.count}>
          {note.text.length} / {MAX_LENGTH}
        </Text>
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Color</Text>
      <View style={styles.row}>
        {COLORS.map((c) => {
          const active = note.color === c;
          return (
            <Pressable
              key={c}
              onPress={() => setNote({ ...note, color: c })}
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

      <Pressable
        onPress={() => setNote({ ...note, text: '' })}
        style={[styles.clearButton, { borderColor: t.cardBorder }]}
      >
        <Text style={[styles.clearText, { color: t.text }]}>Clear note</Text>
      </Pressable>
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
  paper: {
    borderRadius: 20,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noteInput: {
    color: '#1A1A1A',
    fontSize: 17,
    minHeight: 160,
    textAlignVertical: 'top',
    padding: 0,
  },
  count: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  swatch: { width: 44, height: 44, borderRadius: radius.small },
  clearButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  clearText: { fontSize: 14, fontWeight: '600' },
});
