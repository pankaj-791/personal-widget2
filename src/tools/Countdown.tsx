import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radius, spacing, useTheme } from '../theme/theme';
import { usePersistedState } from '../storage/storage';

type EventData = { name: string; year: number; month: number; day: number };

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
const MS_PER_DAY = 86400000;

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function defaultEvent(): EventData {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return {
    name: 'My event',
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

function daysUntil(ev: EventData): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = Date.UTC(ev.year, ev.month - 1, ev.day);
  return Math.round((target - today) / MS_PER_DAY);
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

export default function Countdown() {
  const t = useTheme();
  const [saved, setSaved, loaded] = usePersistedState<EventData | null>(
    'tool.countdown.v1',
    null
  );

  const ev: EventData = saved ?? defaultEvent();

  const change = (patch: Partial<EventData>) => {
    const next = { ...ev, ...patch };
    const maxDay = daysInMonth(next.year, next.month);
    if (next.day > maxDay) next.day = maxDay;
    setSaved(next);
  };

  const days = daysUntil(ev);
  const big =
    days === 0 ? 'Today!' : days > 0 ? `${days}` : `${Math.abs(days)}`;
  const caption =
    days === 0
      ? ''
      : days > 0
      ? days === 1
        ? 'day to go'
        : 'days to go'
      : Math.abs(days) === 1
      ? 'day ago'
      : 'days ago';

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: t.card, borderColor: t.cardBorder },
      ]}
    >
      <Text style={[styles.title, { color: t.text }]}>Days countdown</Text>
      <Text style={[styles.sub, { color: t.textMuted }]}>
        Count the days until something important.
      </Text>

      <View style={styles.display}>
        <Text numberOfLines={1} style={styles.eventName}>
          {loaded ? ev.name : ' '}
        </Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.big}>
          {big}
        </Text>
        <Text style={styles.caption}>{caption === '' ? ' ' : caption}</Text>
        <Text style={styles.dateText}>
          {ev.day} {MONTHS[ev.month - 1]} {ev.year}
        </Text>
      </View>

      <Text style={[styles.label, { color: t.textMuted }]}>Event name</Text>
      <TextInput
        value={ev.name}
        onChangeText={(name) => change({ name })}
        maxLength={30}
        placeholder="Event name"
        placeholderTextColor={t.textMuted}
        style={[styles.input, { color: t.text, borderColor: t.cardBorder }]}
      />

      <Text style={[styles.label, { color: t.textMuted }]}>Date</Text>
      <Stepper
        label="Day"
        display={`${ev.day}`}
        onMinus={() =>
          change({
            day: ev.day <= 1 ? daysInMonth(ev.year, ev.month) : ev.day - 1,
          })
        }
        onPlus={() =>
          change({
            day: ev.day >= daysInMonth(ev.year, ev.month) ? 1 : ev.day + 1,
          })
        }
      />
      <Stepper
        label="Month"
        display={MONTHS[ev.month - 1]}
        onMinus={() => change({ month: ev.month <= 1 ? 12 : ev.month - 1 })}
        onPlus={() => change({ month: ev.month >= 12 ? 1 : ev.month + 1 })}
      />
      <Stepper
        label="Year"
        display={`${ev.year}`}
        onMinus={() => change({ year: Math.max(ev.year - 1, 2000) })}
        onPlus={() => change({ year: Math.min(ev.year + 1, 2100) })}
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
  display: {
    backgroundColor: '#000000',
    borderRadius: radius.card,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  eventName: { color: '#9A9BA3', fontSize: 15, fontWeight: '600' },
  big: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: '800',
    includeFontPadding: false,
    maxWidth: '100%',
  },
  caption: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dateText: { color: '#9A9BA3', fontSize: 13, marginTop: 6 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.small,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
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
    width: 64,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
