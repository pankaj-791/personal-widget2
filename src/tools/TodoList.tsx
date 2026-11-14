import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

type Todo = { id: string; text: string; done: boolean };

const MAX_TODOS = 50;

export default function TodoList() {
  const t = useTheme();
  const [todos, setTodos, loaded] = usePersistedState<Todo[]>(
    'tool.todo.v1',
    []
  );
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  const open = todos.filter((x) => !x.done).length;
  const done = todos.length - open;

  const add = () => {
    const clean = text.trim();
    if (clean === '') return;
    if (todos.length >= MAX_TODOS) {
      setMessage('List is full (50 tasks). Clear some finished ones first.');
      return;
    }
    setTodos([...todos, { id: `t-${Date.now()}`, text: clean, done: false }]);
    setText('');
    setMessage('');
  };

  const toggle = (id: string) => {
    setTodos(todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const remove = (id: string) => {
    setTodos(todos.filter((x) => x.id !== id));
    setMessage('');
  };

  const clearDone = () => {
    setTodos(todos.filter((x) => !x.done));
    setMessage('');
  };

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>To-do list</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        {loaded ? `${open} left  ·  ${done} done` : ' '}
      </Text>

      <View style={styles.addRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
          maxLength={80}
          returnKeyType="done"
          placeholder="Add a task"
          placeholderTextColor={t.textMuted}
          style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
        />
        <Pressable
          onPress={add}
          style={[styles.addButton, { backgroundColor: t.accent }]}
        >
          <Text style={[styles.addText, { color: t.accentText }]}>Add</Text>
        </Pressable>
      </View>

      {message !== '' && (
        <Text style={[styles.message, { color: t.text }]}>{message}</Text>
      )}

      {loaded && todos.length === 0 && (
        <Text style={[styles.empty, { color: t.textMuted }]}>
          No tasks yet. Add your first one above.
        </Text>
      )}

      {todos.map((todo) => (
        <View key={todo.id} style={styles.item}>
          <Pressable onPress={() => toggle(todo.id)} style={styles.itemMain}>
            <View
              style={[
                styles.check,
                {
                  borderColor: todo.done ? t.accent : t.textMuted,
                  backgroundColor: todo.done ? t.accent : 'transparent',
                },
              ]}
            >
              {todo.done && (
                <Text style={[styles.checkMark, { color: t.accentText }]}>
                  ✓
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.itemText,
                {
                  color: t.text,
                  opacity: todo.done ? 0.45 : 1,
                  textDecorationLine: todo.done ? 'line-through' : 'none',
                },
              ]}
            >
              {todo.text}
            </Text>
          </Pressable>
          <Pressable onPress={() => remove(todo.id)} hitSlop={8}>
            <Text style={[styles.delete, { color: t.textMuted }]}>×</Text>
          </Pressable>
        </View>
      ))}

      {done > 0 && (
        <Pressable
          onPress={clearDone}
          style={[styles.clearButton, { borderColor: t.cardBorder }]}
        >
          <Text style={[styles.clearText, { color: t.text }]}>
            Clear finished ({done})
          </Text>
        </Pressable>
      )}
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
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    borderRadius: radius.small,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 15, fontWeight: '700' },
  message: { fontSize: 13, fontWeight: '600', marginTop: spacing.sm },
  empty: { fontSize: 14, marginTop: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkMark: { fontSize: 15, fontWeight: '800', marginTop: -1 },
  itemText: { flex: 1, fontSize: 16 },
  delete: { fontSize: 26, paddingHorizontal: 8 },
  clearButton: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  clearText: { fontSize: 14, fontWeight: '600' },
});
