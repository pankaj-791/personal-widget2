import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius } from '../theme/theme';

export type ClockStyle = 'bold' | 'minimal' | 'stacked';
export type WidgetSize = 'small' | 'medium' | 'large';

export type ClockConfig = {
  style: ClockStyle;
  hour12: boolean;
  showDate: boolean;
  textColor: string;
  backgroundColor: string;
};

export const defaultClockConfig: ClockConfig = {
  style: 'bold',
  hour12: false,
  showDate: true,
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
};

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
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

const FONT_SIZES: Record<WidgetSize, number> = {
  small: 40,
  medium: 64,
  large: 96,
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

type Props = {
  config?: ClockConfig;
  size?: WidgetSize;
};

export default function ClockWidget({
  config = defaultClockConfig,
  size = 'medium',
}: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours24 = now.getHours();
  const hours = config.hour12 ? hours24 % 12 || 12 : hours24;
  const hourText = config.hour12 ? `${hours}` : pad(hours);
  const minuteText = pad(now.getMinutes());
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const dateText = `${DAYS[now.getDay()]}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  }`;

  const fontSize = FONT_SIZES[size];
  const weight =
    config.style === 'minimal' ? '200' : config.style === 'bold' ? '800' : '700';

  return (
    <View
      style={[styles.container, { backgroundColor: config.backgroundColor }]}
    >
      {config.style === 'stacked' ? (
        <View style={styles.stacked}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.time,
              { color: config.textColor, fontSize, fontWeight: weight },
            ]}
          >
            {hourText}
          </Text>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.time,
              { color: config.textColor, fontSize, fontWeight: weight },
            ]}
          >
            {minuteText}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[
              styles.time,
              { color: config.textColor, fontSize, fontWeight: weight },
            ]}
          >
            {hourText}:{minuteText}
          </Text>
          {config.hour12 && (
            <Text
              style={[
                styles.suffix,
                { color: config.textColor, fontSize: fontSize * 0.28 },
              ]}
            >
              {suffix}
            </Text>
          )}
        </View>
      )}
      {config.showDate && (
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.date,
            { color: config.textColor, fontSize: Math.max(fontSize * 0.25, 13) },
          ]}
        >
          {dateText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: radius.card,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  stacked: { alignItems: 'center' },
  time: { includeFontPadding: false },
  suffix: { marginLeft: 6, marginBottom: 6, fontWeight: '600' },
  date: { marginTop: 4, opacity: 0.7 },
});
