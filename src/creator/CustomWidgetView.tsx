import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CustomWidgetSpec, fontFamily } from './widgetSpec';
import { getExtra, withAlpha } from './extraStyle';

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

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

type Props = {
  spec: CustomWidgetSpec;
};

export default function CustomWidgetView({ spec }: Props) {
  const [now, setNow] = useState(new Date());
  const extra = getExtra(spec);

  useEffect(() => {
    const ms = spec.kind === 'clock' ? 1000 : 60000;
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [spec.kind]);

  const hours24 = now.getHours();
  const hours = spec.hour12 ? hours24 % 12 || 12 : hours24;
  const hourText = spec.hour12 ? `${hours}` : pad(hours);
  const timeText = `${hourText}:${pad(now.getMinutes())}${
    spec.hour12 ? (hours24 >= 12 ? ' PM' : ' AM') : ''
  }`;
  const dateText = `${DAYS[now.getDay()]}, ${now.getDate()} ${
    MONTHS[now.getMonth()]
  }`;

  const inner = spec.height - spec.padding * 2;
  const mainFont = Math.max(
    Math.min(inner * (spec.kind === 'clock' ? 0.5 : 0.4), 96),
    16
  );
  const smallFont = Math.max(mainFont * 0.3, 12);
  const iconFont = Math.max(Math.min(inner * 0.28, 40), 18);

  const main =
    spec.kind === 'clock'
      ? timeText
      : spec.kind === 'date'
      ? dateText
      : spec.text;

  const fill = extra.glass
    ? withAlpha(spec.backgroundColor, extra.glassStrength)
    : withAlpha(spec.backgroundColor, extra.opacity);

  const edgeWidth = extra.glass ? Math.max(extra.borderWidth, 1) : extra.borderWidth;
  const edgeColor =
    extra.glass && extra.borderWidth === 0
      ? 'rgba(255, 255, 255, 0.40)'
      : extra.borderColor;

  const flexAlign =
    extra.align === 'left'
      ? 'flex-start'
      : extra.align === 'right'
      ? 'flex-end'
      : 'center';

  const textStyle = {
    color: spec.textColor,
    fontFamily: fontFamily(spec.font),
    fontWeight: spec.weight,
    letterSpacing: extra.letterSpacing,
    textAlign: extra.align,
    ...(extra.textShadow
      ? {
          textShadowColor: 'rgba(0, 0, 0, 0.45)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }
      : {}),
  } as const;

  return (
    <View
      style={[
        styles.outer,
        {
          width: `${spec.widthPct}%`,
          height: spec.height,
          borderRadius: spec.borderRadius,
          ...(extra.shadow
            ? { boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.4)' }
            : {}),
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            borderRadius: spec.borderRadius,
            padding: spec.padding,
            backgroundColor: fill,
            borderWidth: edgeWidth,
            borderColor: edgeColor,
            alignItems: flexAlign,
          },
        ]}
      >
        {spec.imageUri && (
          <>
            <Image
              source={{ uri: spec.imageUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={[StyleSheet.absoluteFill, styles.dim]} />
          </>
        )}

        {extra.glass && <View style={styles.highlight} />}

        {spec.icon !== '' && (
          <Text style={{ fontSize: iconFont, marginBottom: 2 }}>
            {spec.icon}
          </Text>
        )}

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.main, textStyle, { fontSize: mainFont }]}
        >
          {main}
        </Text>

        {spec.kind === 'clock' && spec.showDate && (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.small, textStyle, { fontSize: smallFont }]}
          >
            {dateText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignSelf: 'center' },
  inner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dim: { backgroundColor: 'rgba(0, 0, 0, 0.35)' },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
  },
  main: { maxWidth: '100%', includeFontPadding: false },
  small: { maxWidth: '100%', opacity: 0.75, marginTop: 4 },
});
