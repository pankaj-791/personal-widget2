import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import CalendarWidget, {
  CalendarConfig,
  defaultCalendarConfig,
} from './CalendarWidget';

const CALENDAR_COLORS: CalendarConfig[] = [
  {
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    todayBackground: '#FFFFFF',
    todayText: '#000000',
  },
  {
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
    todayBackground: '#000000',
    todayText: '#FFFFFF',
  },
  {
    textColor: '#FFFFFF',
    backgroundColor: '#1F3A8A',
    todayBackground: '#FFD60A',
    todayText: '#000000',
  },
  {
    textColor: '#FFFFFF',
    backgroundColor: '#14532D',
    todayBackground: '#FFFFFF',
    todayText: '#14532D',
  },
];

export default function CalendarSection() {
  const t = useTheme();
  const [calendar, setCalendar] = useState<CalendarConfig>(
    defaultCalendarConfig
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Calendar</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Use the arrows to change month. Tap the title to return to today.
      </Text>

      <View style={styles.preview}>
        <CalendarWidget config={calendar} />
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Color</Text>
      <View style={styles.row}>
        {CALENDAR_COLORS.map((c) => {
          const active =
            calendar.backgroundColor === c.backgroundColor &&
            calendar.todayBackground === c.todayBackground;
          return (
            <Pressable
              key={c.backgroundColor + c.todayBackground}
              onPress={() => setCalendar(c)}
              style={[
                styles.swatch,
                {
                  backgroundColor: c.backgroundColor,
                  borderColor: active ? t.accent : t.cardBorder,
                  borderWidth: active ? 3 : 1,
                },
              ]}
            >
              <View
                style={[styles.todayDot, { backgroundColor: c.todayBackground }]}
              />
            </Pressable>
          );
        })}
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
  sub: { fontSize: 14, marginTop: spacing.xs },
  preview: { marginVertical: spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: {
    width: 52,
    height: 40,
    borderRadius: radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayDot: { width: 24, height: 14, borderRadius: radius.pill },
});
