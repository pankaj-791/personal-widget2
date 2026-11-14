import { useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Canvas,
  ColorMatrix,
  Image as SkiaImage,
  useImage,
} from '@shopify/react-native-skia';
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
  const image = useImage(uri);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const height = width / ASPECT[shape];
  const borderRadius = shape === 'circle' ? height / 2 : 28;
  const boxWidth = shape === 'circle' || shape === 'tall' ? height * ASPECT[shape] : width;

  return (
    <View onLayout={onLayout} style={styles.wrapper}>
      <Pressable
        onPress={onPress}
        style={[
          styles.box,
          { width: boxWidth, height, borderRadius },
        ]}
      >
        {uri && image ? (
          <Canvas style={{ width: boxWidth, height }}>
            <SkiaImage
              image={image}
              x={0}
              y={0}
              width={boxWidth}
              height={height}
              fit="cover"
            >
              <ColorMatrix matrix={buildMatrix(filter, adjustments)} />
            </SkiaImage>
          </Canvas>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {uri ? 'Loading...' : 'Tap to choose a photo'}
            </Text>
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
});
