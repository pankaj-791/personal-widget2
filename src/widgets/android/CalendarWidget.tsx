import { FlexWidget, TextWidget } from 'react-native-android-widget';

type Props = {
  year: number;
  month: number; // 0 to 11
  today: number | null; // day of the month to highlight, or null
  widthDp: number;
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
const PAD = 12;

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

export function CalendarWidget({ year, month, today, widthDp }: Props) {
  const cell = Math.floor((widthDp - PAD * 2) / 7);
  const rowH = clamp(Math.floor(cell * 0.8), 22, 34);
  const dayFont = clamp(Math.floor(cell * 0.4), 11, 16);
  const titleFont = clamp(Math.floor(widthDp * 0.07), 16, 24);
  const weeks = buildWeeks(year, month);

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: '#000000',
        borderRadius: 28,
        padding: PAD,
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <FlexWidget clickAction="CAL_TODAY">
          <TextWidget
            text={`${MONTHS[month]} ${year}`}
            style={{ fontSize: titleFont, color: '#FFFFFF', fontWeight: 'bold' }}
          />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'row' }}>
          <FlexWidget
            clickAction="CAL_PREV"
            style={{
              width: 36,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextWidget text="‹" style={{ fontSize: 24, color: '#FFFFFF' }} />
          </FlexWidget>
          <FlexWidget
            clickAction="CAL_NEXT"
            style={{
              width: 36,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextWidget text="›" style={{ fontSize: 24, color: '#FFFFFF' }} />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      <FlexWidget style={{ flexDirection: 'row' }}>
        {WEEKDAYS.map((w) => (
          <FlexWidget
            key={w}
            style={{
              width: cell,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TextWidget
              text={w}
              style={{ fontSize: dayFont - 1, color: '#9A9BA3' }}
            />
          </FlexWidget>
        ))}
      </FlexWidget>

      {weeks.map((week, wi) => (
        <FlexWidget key={wi} style={{ flexDirection: 'row' }}>
          {week.map((day, di) => {
            const isToday = day !== null && day === today;
            return (
              <FlexWidget
                key={di}
                style={{
                  width: cell,
                  height: rowH,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {day !== null && (
                  <FlexWidget
                    style={{
                      width: isToday ? cell - 4 : cell,
                      height: isToday ? rowH - 4 : rowH,
                      borderRadius: 999,
                      backgroundColor: isToday ? '#FFFFFF' : '#000000',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TextWidget
                      text={`${day}`}
                      style={{
                        fontSize: dayFont,
                        color: isToday ? '#000000' : '#FFFFFF',
                        fontWeight: isToday ? 'bold' : 'normal',
                      }}
                    />
                  </FlexWidget>
                )}
              </FlexWidget>
            );
          })}
        </FlexWidget>
      ))}
    </FlexWidget>
  );
                      }
