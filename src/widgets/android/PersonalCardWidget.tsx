import { FlexWidget, ImageWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetApp } from './QuickLaunchWidget';

export type WidgetCard = {
  name: string;
  tagline: string;
  slots: (WidgetApp | null)[];
};

type Props = {
  card: WidgetCard;
};

const SLOT = 44;
const GAP = 8;

function shorten(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function PersonalCardWidget({ card }: Props) {
  const slots = [0, 1, 2, 3].map((i) => card.slots[i] ?? null);
  const initial = (card.name.trim()[0] ?? '?').toUpperCase();

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#14161B',
        borderRadius: 28,
        padding: 14,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <FlexWidget
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#2E3340',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <TextWidget
            text={initial}
            style={{ fontSize: 20, color: '#FFFFFF', fontWeight: 'bold' }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text={shorten(card.name, 18)}
            style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}
          />
          <TextWidget
            text={shorten(card.tagline, 26)}
            style={{ fontSize: 13, color: '#9A9BA3' }}
          />
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row' }}>
        {slots.map((app, index) => (
          <FlexWidget
            key={index}
            clickAction={app ? 'LAUNCH_APP' : 'OPEN_APP'}
            clickActionData={app ? { packageName: app.packageName } : undefined}
            style={{
              width: SLOT,
              height: SLOT,
              borderRadius: 14,
              backgroundColor: '#23252C',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: index < 3 ? GAP : 0,
            }}
          >
            {app ? (
              <ImageWidget
                image={`data:image/png;base64,${app.icon}` as `data:image/png;base64,${string}`}
                imageWidth={32}
                imageHeight={32}
              />
            ) : (
              <TextWidget
                text="+"
                style={{ fontSize: 22, color: '#6B6C75' }}
              />
            )}
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
