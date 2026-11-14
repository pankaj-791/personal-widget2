import { useEffect, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { applyFilter } from '../native/ImageFilter';
import {
  Adjustments,
  FilterName,
  buildMatrix,
  defaultAdjustments,
} from './imageFilters';

export type ImageShape = 'wide' | 'square' | 'circle' | 'tall';

export const SHAPES: { key: ImageShape; label: string }[] = [
  { key: 'wide', label: 'Wide' },
  { key: 'square', label: 'Square' },
  { key: 'circle', label: 'Circle' },
  { key: 'tall', label: 'Tall' },
];

const ASPECT: Record<ImageShape, number> = {
  wide: 16 / 9,
  square: 1,
  circle: 1,
  tall: 3 / 4,
};

type Props = {
  uri: string | null;
  filter?: FilterName;
  adjustments?: Adjustments;
  shape?: ImageShape;
  onPress?: () => void;
};

export default function ImageWidget({
  uri,
  filter = 'original',
  adjustments = defaultAdjustments,
  shape = 'wide',
  onPress,
}: Props) {
  const [width, setWidth] = useState(300);
  const [shownUri, setShownUri] = useState<string | null>(uri);
  const [working, setWorking] = useState(false);

  const { brightness, contrast, saturation } = adjustments;

  useEffect(() => {
    if (!uri) {
      setShownUri(null);
      return;
    }
    const untouched =
      filter === 'original' &&
      brightness === defaultAdjustments.brightness &&
      contrast === defaultAdjustments.contrast &&
      saturation === defaultAdjustments.saturation;
    if (untouched) {
      setShownUri(uri);
      setWorking(false);
      return;
    }

    let cancelled = false;
    setWorking(true);
    const timer = setTimeout(async () => {
      const matrix = buildMatrix(filter, { brightness, contrast, saturation });
      const result = await applyFilter(uri, matrix);
      if (cancelled) return;
      setShownUri(result ?? uri);
      setWorking(false);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [uri, filter, brightness, contrast, saturation]);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const height = width / ASPECT[shape];
  const borderRadius = shape === 'circle' ? height / 2 : 28;
  const boxWidth =
    shape === 'circle' || shape === 'tall' ? height * ASPECT[shape] : width;

  return (
    <View onLayout={onLayout} style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        style={[styles.box, { width: boxWidth, height, borderRadius }]}
      >
        {shownUri ? (
          <Image
            source={{ uri: shownUri }}
            style={{ width: boxWidth, height }}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to choose a photo</Text>
          </View>
        )}
        {working && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Updating...</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center' },
  box: {
    overflow: 'hidden',
    backgroundColor: '#14161B',
    borderWidth: 1,
    borderColor: '#2A2B31',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  placeholderText: { color: '#9A9BA3', fontSize: 14, textAlign: 'center' },
  badge: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
});
