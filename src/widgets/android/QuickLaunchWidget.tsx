import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';

export type WidgetApp = {
  packageName: string;
  label: string;
  icon: string;
};

type Props = {
  apps: WidgetApp[];
  widthDp: number;
};

const TILE = 52;
const GAP = 8;
const PAD = 12;

export function QuickLaunchWidget({ apps, widthDp }: Props) {
  const fit = Math.floor((widthDp - PAD * 2 + GAP) / (TILE + GAP));
  const count = Math.max(1, Math.min(fit, 8));
  const shown = apps.slice(0, count);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        borderRadius: 28,
        padding: PAD,
      }}
    >
      {shown.length === 0 ? (
        <TextWidget
          text="Open Personal Widget and add apps to Quick Launch"
          style={{ fontSize: 13, color: '#9A9BA3' }}
        />
      ) : (
        shown.map((app, index) => (
          <FlexWidget
            key={app.packageName}
            clickAction="LAUNCH_APP"
            clickActionData={{ packageName: app.packageName }}
            style={{
              width: TILE,
              height: TILE,
              borderRadius: 16,
              backgroundColor: '#1A1B1F',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: index < shown.length - 1 ? GAP : 0,
            }}
          >
            <ImageWidget
              image={`data:image/png;base64,${app.icon}` as `data:image/png;base64,${string}`}
              imageWidth={36}
              imageHeight={36}
            />
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
