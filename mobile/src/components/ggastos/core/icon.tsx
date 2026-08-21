import Svg, { Line, SvgUri } from 'react-native-svg';

const CDN_BASE = 'https://unpkg.com/lucide-static@latest/icons/';

type IconProps = {
  name: string;
  size?: number;
  color?: string;
};

/**
 * GGastos ships no bespoke icon set. Icons are Lucide, loaded per-icon from
 * the lucide-static CDN via react-native-svg. As with the web kit, these
 * render in the CDN's fixed stroke color and do not tint with currentColor.
 */
export function Icon({ name, size = 20, color }: IconProps) {
  if (name === 'plus' && color) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }

  return <SvgUri uri={`${CDN_BASE}${name}.svg`} width={size} height={size} />;
}
