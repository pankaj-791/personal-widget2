import { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import qrcode from 'qrcode-generator';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

const MAX_LENGTH = 150;
const MAX_SIZE = 280;
const QUIET = 4;

type Run = { row: number; col: number; length: number };

type QrData = { count: number; runs: Run[] } | null;

function buildQr(text: string): { data: QrData; error: string } {
  if (text.trim() === '') return { data: null, error: '' };
  try {
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const runs: Run[] = [];
    for (let row = 0; row < count; row++) {
      let start = -1;
      for (let col = 0; col <= count; col++) {
        const dark = col < count && qr.isDark(row, col);
        if (dark && start < 0) start = col;
        if (!dark && start >= 0) {
          runs.push({ row, col: start, length: col - start });
          start = -1;
        }
      }
    }
    return { data: { count, runs }, error: '' };
  } catch {
    return { data: null, error: 'This text could not be turned into a QR code.' };
  }
}

export default function QrGenerator() {
  const t = useTheme();
  const [text, setText, loaded] = usePersistedState<string>(
    'tool.qr.v1',
    'https://'
  );
  const [width, setWidth] = useState(280);

  const { data, error } = useMemo(() => buildQr(text), [text]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const size = Math.min(width, MAX_SIZE);
  const total = data ? data.count + QUIET * 2 : 1;
  const cell = Math.max(Math.floor(size / total), 1);
  const px = cell * total;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>QR code generator</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Type a link or any text. Scan the code with another phone to test it.
      </Text>

      <TextInput
        value={loaded ? text : ''}
        onChangeText={setText}
        multiline
        maxLength={MAX_LENGTH}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Link or text"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
      />
      <Text style={[styles.count, { color: t.textMuted }]}>
        {text.length} / {MAX_LENGTH}
      </Text>

      <View onLayout={onLayout} style={styles.qrWrap}>
        {data ? (
          <View style={[styles.qr, { width: px, height: px }]}>
            {data.runs.map((run, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: (run.col + QUIET) * cell,
                  top: (run.row + QUIET) * cell,
                  width: run.length * cell,
                  height: cell,
                  backgroundColor: '#000000',
                }}
              />
            ))}
          </View>
        ) : (
          <Text style={[styles.placeholder, { color: t.textMuted }]}>
            {error !== '' ? error : 'Your QR code appears here.'}
          </Text>
        )}
      </View>

      <Pressable
        onPress={() => setText('')}
        style={[styles.clearButton, { borderColor: t.cardBorder }]}
      >
        <Text style={[styles.clearText, { color: t.text }]}>Clear</Text>
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
  count: { fontSize: 12, alignSelf: 'flex-end', marginTop: 4 },
  qrWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    marginTop: spacing.md,
  },
  qr: { backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },
  placeholder: { fontSize: 14, textAlign: 'center' },
  clearButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  clearText: { fontSize: 14, fontWeight: '600' },
});
