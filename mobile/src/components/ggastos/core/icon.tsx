import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { GgastosColors } from '@/constants/ggastos-theme';

type IconProps = { name: string; size?: number; color?: string };

export function Icon({ name, size = 20, color = GgastosColors.inkStrong }: IconProps) {
  const common = { stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'plus' ? <><Line {...common} x1="12" y1="5" x2="12" y2="19" /><Line {...common} x1="5" y1="12" x2="19" y2="12" /></> : null}
      {name === 'x' ? <><Line {...common} x1="18" y1="6" x2="6" y2="18" /><Line {...common} x1="6" y1="6" x2="18" y2="18" /></> : null}
      {name === 'check' ? <Polyline {...common} points="20 6 9 17 4 12" /> : null}
      {name === 'check-check' ? <><Polyline {...common} points="18 6 7 17 2 12" /><Polyline {...common} points="22 10 15 17 13 15" /></> : null}
      {name === 'chevron-left' ? <Polyline {...common} points="15 18 9 12 15 6" /> : null}
      {name === 'chevron-right' ? <Polyline {...common} points="9 18 15 12 9 6" /> : null}
      {name === 'circle' ? <Circle {...common} cx="12" cy="12" r="9" /> : null}
      {name === 'check-circle-2' ? <><Circle {...common} cx="12" cy="12" r="10" /><Polyline {...common} points="8 12 11 15 16 9" /></> : null}
      {name === 'circle-alert' ? <><Circle {...common} cx="12" cy="12" r="10" /><Line {...common} x1="12" y1="8" x2="12" y2="12" /><Line {...common} x1="12" y1="16" x2="12.01" y2="16" /></> : null}
      {name === 'clock' ? <><Circle {...common} cx="12" cy="12" r="9" /><Polyline {...common} points="12 7 12 12 15 14" /></> : null}
      {name === 'calendar' ? <><Rect {...common} x="3" y="5" width="18" height="16" rx="2" /><Line {...common} x1="16" y1="3" x2="16" y2="7" /><Line {...common} x1="8" y1="3" x2="8" y2="7" /><Line {...common} x1="3" y1="11" x2="21" y2="11" /></> : null}
      {name === 'calendar-check' ? <><Rect {...common} x="3" y="5" width="18" height="16" rx="2" /><Line {...common} x1="16" y1="3" x2="16" y2="7" /><Line {...common} x1="8" y1="3" x2="8" y2="7" /><Line {...common} x1="3" y1="11" x2="21" y2="11" /><Polyline {...common} points="8 16 10 18 15 13" /></> : null}
      {name === 'calendar-range' ? <><Rect {...common} x="3" y="5" width="18" height="16" rx="2" /><Line {...common} x1="16" y1="3" x2="16" y2="7" /><Line {...common} x1="8" y1="3" x2="8" y2="7" /><Line {...common} x1="3" y1="11" x2="21" y2="11" /><Line {...common} x1="8" y1="15" x2="16" y2="15" /></> : null}
      {name === 'calendar-plus' ? <><Rect {...common} x="3" y="5" width="18" height="16" rx="2" /><Line {...common} x1="16" y1="3" x2="16" y2="7" /><Line {...common} x1="8" y1="3" x2="8" y2="7" /><Line {...common} x1="3" y1="11" x2="21" y2="11" /><Line {...common} x1="12" y1="14" x2="12" y2="18" /><Line {...common} x1="10" y1="16" x2="14" y2="16" /></> : null}
      {name === 'list-checks' ? <><Line {...common} x1="10" y1="6" x2="21" y2="6" /><Line {...common} x1="10" y1="12" x2="21" y2="12" /><Line {...common} x1="10" y1="18" x2="21" y2="18" /><Polyline {...common} points="3 6 4 7 6 4" /><Polyline {...common} points="3 12 4 13 6 10" /><Polyline {...common} points="3 18 4 19 6 16" /></> : null}
      {name === 'list-todo' ? <><Rect {...common} x="3" y="4" width="18" height="17" rx="2" /><Line {...common} x1="8" y1="9" x2="17" y2="9" /><Line {...common} x1="8" y1="15" x2="17" y2="15" /><Circle {...common} cx="5.5" cy="9" r=".5" /><Circle {...common} cx="5.5" cy="15" r=".5" /></> : null}
      {name === 'repeat' ? <><Path {...common} d="m17 2 4 4-4 4" /><Path {...common} d="M3 11V9a3 3 0 0 1 3-3h15" /><Path {...common} d="m7 22-4-4 4-4" /><Path {...common} d="M21 13v2a3 3 0 0 1-3 3H3" /></> : null}
      {name === 'settings' ? <><Circle {...common} cx="12" cy="12" r="3" /><Path {...common} d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 2-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.8v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2-2 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H5.7v-2.8h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L7 8l2-2 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h2.8v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3L17.8 6l2 2-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" /></> : null}
      {name === 'inbox' ? <><Path {...common} d="M4 4h16v12l-3 4H7l-3-4z" /><Path {...common} d="M4 16h5l2 2h2l2-2h5" /></> : null}
      {name === 'file-up' ? <><Path {...common} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><Polyline {...common} points="14 2 14 8 20 8" /><Polyline {...common} points="12 18 12 12" /><Polyline {...common} points="9 15 12 12 15 15" /></> : null}
      {name === 'upload' ? <><Path {...common} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><Polyline {...common} points="17 8 12 3 7 8" /><Line {...common} x1="12" y1="3" x2="12" y2="15" /></> : null}
      {name === 'tags' ? <><Path {...common} d="m15 5 4 4-8.5 8.5a2.1 2.1 0 0 1-3 0L3 13V5z" /><Circle {...common} cx="7" cy="9" r="1" /><Path {...common} d="m10 2 12 12" /></> : null}
      {!['plus', 'x', 'check', 'check-check', 'chevron-left', 'chevron-right', 'circle', 'check-circle-2', 'circle-alert', 'clock', 'calendar', 'calendar-check', 'calendar-range', 'calendar-plus', 'list-checks', 'list-todo', 'repeat', 'settings', 'inbox', 'file-up', 'upload', 'tags'].includes(name) ? <Circle {...common} cx="12" cy="12" r="8" /> : null}
    </Svg>
  );
}
