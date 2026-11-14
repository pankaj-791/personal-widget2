import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import TodoList from './TodoList';
import QrGenerator from './QrGenerator';
import StickyNote from './StickyNote';
import Countdown from './Countdown';

type ToolKey = 'todo' | 'qr' | 'note' | 'countdown';

const TOOLS: { key: ToolKey; label: string }[] = [
  { key: 'todo', label: 'To-do' },
  { key: 'qr', label: 'QR code' },
  { key: 'note', label: 'Note' },
  { key: 'countdown', label: 'Countdown' },
];

export default function ToolsSection() {
  const t = useTheme();
  const [tool, setTool] = useState<ToolKey>('todo');

  return (
    <View>
      <Text style={[styles.heading, { color: t.text }]}>Tools</Text>
      <View style={styles.row}>
        {TOOLS.map((x) => {
          const active = x.key === tool;
          return (
            <Pressable
              key={x.key}
              onPress={() => setTool(x.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? t.accent : 'transparent',
                  borderColor: active ? t.accent : t.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? t.accentText : t.text },
                ]}
              >
                {x.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tool === 'todo' && <TodoList />}
      {tool === 'qr' && <QrGenerator />}
      {tool === 'note' && <StickyNote />}
      {tool === 'countdown' && <Countdown />}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
});
