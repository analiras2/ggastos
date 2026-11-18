import manrope500 from '@fontsource/manrope/files/manrope-latin-500-normal.woff2?url';
import manrope600 from '@fontsource/manrope/files/manrope-latin-600-normal.woff2?url';
import manrope700 from '@fontsource/manrope/files/manrope-latin-700-normal.woff2?url';
import spaceGrotesk600 from '@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2?url';
import spaceGrotesk700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2?url';

import { GgastosFonts } from '@/shared/theme/ggastos-theme';

// Latin subset: covers Portuguese. Characters outside it fall back to the system font.
const FONT_FILES: Record<string, string> = {
  [GgastosFonts.body]: manrope500,
  [GgastosFonts.bodySemibold]: manrope600,
  [GgastosFonts.bodyBold]: manrope700,
  [GgastosFonts.displaySemibold]: spaceGrotesk600,
  [GgastosFonts.display]: spaceGrotesk700,
};

// Registers each font under the family name the theme already uses, so no style changes.
export function loadAppFonts(): Promise<unknown> {
  const loads = Object.entries(FONT_FILES).map(async ([family, url]) => {
    const face = new FontFace(family, `url(${url}) format('woff2')`);
    await face.load();
    document.fonts.add(face);
  });

  return Promise.all(loads);
}
