import { SvgUri } from 'react-native-svg';

const CDN_BASE = 'https://unpkg.com/lucide-static@latest/icons/';

type IconProps = {
  name: string;
  size?: number;
};

/**
 * GGastos ships no bespoke icon set. Icons are Lucide, loaded per-icon from
 * the lucide-static CDN via react-native-svg. As with the web kit, these
 * render in the CDN's fixed stroke color and do not tint with currentColor.
 */
export function Icon({ name, size = 20 }: IconProps) {
  return <SvgUri uri={`${CDN_BASE}${name}.svg`} width={size} height={size} />;
}
