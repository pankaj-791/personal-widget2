import { FlexWidget, TextWidget } from 'react-native-android-widget';

type Props = {
  taps: number;
  updatedAt: string;
};

export function HelloWidget({ taps, updatedAt }: Props) {
  return (
    <FlexWidget
      clickAction="TEST_TAP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 24,
      }}
    >
      <TextWidget
        text="Personal Widget"
        style={{ fontSize: 16, color: '#9A9BA3' }}
      />
      <TextWidget
        text={`Taps: ${taps}`}
        style={{ fontSize: 30, color: '#FFFFFF', fontWeight: 'bold' }}
      />
      <TextWidget
        text={`Updated ${updatedAt}`}
        style={{ fontSize: 12, color: '#9A9BA3' }}
      />
    </FlexWidget>
  );
}
