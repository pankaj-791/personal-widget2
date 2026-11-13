import { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { radius } from '../theme/theme';
import { iconUri } from '../native/InstalledApps';

export type SavedApp = {
  packageName: string;
  label: string;
  icon: string;
};

export type PersonalCardConfig = {
  name: string;
  tagline: string;
  slots: (SavedApp | null)[];
};

export const defaultPersonalCard: PersonalCardConfig = {
  name: 'Your name',
  tagline: 'Your tagline',
  slots: [null, null, null, null],
};

const PADDING = 20;
const GAP = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type Props = {
  config: PersonalCardConfig;
  onSlotPress: (index: number) => void;
  onSlotLongPress: (index: number) => void;
};

export default function PersonalCardWidget({
  config,
  onSlotPress,
  onSlotLongPress,
}: Props) {
  const [width, setWidth] = useState(320);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const avatar = clamp(width * 0.24, 56, 96);
  const textWidth = width - PADDING * 2 - avatar - GAP * 1.6;
  const slotSize = clamp((textWidth - GAP * 3) / 4, 30, 54);
  const nameFont = clamp(width * 0.065, 18, 28);
  const taglineFont = clamp(width * 0.042, 13, 18);
  const initial = (config.name.trim()[0] ?? '?').toUpperCase();

  return (
    <View onLayout={onLayout} style={styles.container}>
      <View style={[styles.avatar, { width: avatar, height: avatar }]}>
        <Text style={[styles.initial, { fontSize: avatar * 0.42 }]}>
          {initial}
        </Text>
      </View>

      <View style={styles.info}>
        <Text
          numberOfLines={1}
          style={[styles.name, { fontSize: nameFont }]}
        >
          {config.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.tagline, { fontSize: taglineFont }]}
        >
          {config.tagline}
        </Text>

        <View style={styles.slots}>
          {config.slots.map((slot, index) => (
            <Pressable
              key={index}
              onPress={() => onSlotPress(index)}
              onLongPress={() => onSlotLongPress(index)}
              style={[
                styles.slot,
                {
                  width: slotSize,
                  height: slotSize,
                  marginRight: index < 3 ? GAP : 0,
                },
              ]}
            >
              {slot ? (
                <Image
                  source={{ uri: iconUri(slot) }}
                  style={{
                    width: slotSize * 0.72,
                    height: slotSize * 0.72,
                    borderRadius: slotSize * 0.18,
                  }}
                />
              ) : (
                <Text style={[styles.plus, { fontSize: slotSize * 0.5 }]}>
                  +
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14161B',
    borderColor: '#2A2B31',
    borderWidth: 1,
    borderRadius: radius.card,
    padding: PADDING,
  },
  avatar: {
    borderRadius: 999,
    backgroundColor: '#2E3340',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: GAP * 1.6,
  },
  initial: { color: '#FFFFFF', fontWeight: '700' },
  info: { flex: 1 },
  name: { color: '#FFFFFF', fontWeight: '700' },
  tagline: { color: '#9A9BA3', marginTop: 2 },
  slots: { flexDirection: 'row', marginTop: 12 },
  slot: {
    borderRadius: 12,
    backgroundColor: '#23252C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { color: '#6B6C75', fontWeight: '300' },
});
