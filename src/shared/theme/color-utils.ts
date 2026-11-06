export type Hsv = { hue: number; saturation: number; value: number };

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;
const DEGREES_PER_TURN = 360;
const HUE_SECTOR_DEGREES = 60;
const BYTE_MAX = 255;
const ACHROMATIC_HUE = 0;

export function isValidHex(hex: string): boolean {
  return HEX_PATTERN.test(hex);
}

function channelToHex(channel: number): string {
  return Math.round(channel * BYTE_MAX).toString(16).padStart(2, '0');
}

// hue in degrees [0, 360), saturation and value in [0, 1].
export function hsvToHex({ hue, saturation, value }: Hsv): string {
  const chroma = value * saturation;
  const sector = (((hue % DEGREES_PER_TURN) + DEGREES_PER_TURN) % DEGREES_PER_TURN) / HUE_SECTOR_DEGREES;
  const secondary = chroma * (1 - Math.abs((sector % 2) - 1));
  const offset = value - chroma;

  const sectorIndex = Math.floor(sector);
  const [red, green, blue] = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary],
  ][sectorIndex] ?? [chroma, secondary, 0];

  return `#${channelToHex(red + offset)}${channelToHex(green + offset)}${channelToHex(blue + offset)}`.toUpperCase();
}

export function hexToHsv(hex: string): Hsv {
  const red = parseInt(hex.slice(1, 3), 16) / BYTE_MAX;
  const green = parseInt(hex.slice(3, 5), 16) / BYTE_MAX;
  const blue = parseInt(hex.slice(5, 7), 16) / BYTE_MAX;

  const max = Math.max(red, green, blue);
  const delta = max - Math.min(red, green, blue);

  let hue = ACHROMATIC_HUE;
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = (hue * HUE_SECTOR_DEGREES + DEGREES_PER_TURN) % DEGREES_PER_TURN;
  }

  return { hue, saturation: max === 0 ? 0 : delta / max, value: max };
}
