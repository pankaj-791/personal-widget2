import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '../theme/theme';

export type CalendarConfig = {
  textColor: string;
  backgroundColor: string;
  todayBackground: string;
  todayText: string;
};

export const defaultCalendarConfig: CalendarConfig = {
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
  todayBackground: '#FFFFFF',
  todayText: '#000000',
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const PADDING = 16;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildWeeks(year: number, month: number): (number | null)[][] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

type Props = {
  config?: CalendarConfig;
};

export default function CalendarWidget({
  config = defaultCalendarConfig,
}: Props) {
  const today = new Date();
  const [view, setView] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [width, setWidth] = useState(320);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const shift = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const goToday = () => {
    const n = new Date();
    setView({ year: n.getFullYear(), month: n.getMonth() });
  };

  const cellWidth = (width - PADDING * 2) / 7;
  const dayFont = clamp(cellWidth * 0.38, 11, 20);
  const titleFont = clamp(width * 0.09, 18, 34);
  const rowHeight = dayFont * 2.4;
  const weeks = buildWeeks(view.year, view.month);
  const isCurrentMonth =
    view.year === today.getFullYear() && view.month === today.getMonth();

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor, padding: PADDING },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={goToday} style={styles.titleWrap}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.title,
              { color: config.textColor, fontSize: titleFont },
            ]}
          >
            {MONTHS[view.month]} {view.year}
          </Text>
        </Pressable>
        <View style={styles.arrows}>
          <Pressable onPress={() => shift(-1)} style={styles.arrow}>
            <Text style={[styles.arrowText, { color: config.textColor }]}>
              ‹
            </Text>
          </Pressable>
          <Pressable onPress={() => shift(1)} style={styles.arrow}>
            <Text style={[styles.arrowText, { color: config.textColor }]}>
              ›
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={{ width: cellWidth, alignItems: 'center' }}>
            <Text
              style={{
                color: config.textColor,
                fontSize: dayFont * 0.85,
                opacity: 0.7,
                fontWeight: '600',
              }}
            >
              {w}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((day, di) => {
            const isToday = isCurrentMonth && day === today.getDate();
            return (
              <View
                key={di}
                style={{
                  width: cellWidth,
                  height: rowHeight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {day !== null && (
                  <View
                    style={[
                      styles.dayPill,
                      {
                        width: cellWidth * 0.92,
                        height: dayFont * 2.2,
                        backgroundColor: isToday
                          ? config.todayBackground
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: dayFont,
                        fontWeight: isToday ? '700' : '400',
                        color: isToday ? config.todayText : config.textColor,
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleWrap: { flex: 1, marginRight: 8 },
  title: { fontWeight: '800' },
  arrows: { flexDirection: 'row' },
  arrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 30, fontWeight: '600', marginTop: -4 },
  week: { flexDirection: 'row' },
  dayPill: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
