import manrope500 from '@expo-google-fonts/manrope/500Medium/Manrope_500Medium.ttf?url';
import manrope600 from '@expo-google-fonts/manrope/600SemiBold/Manrope_600SemiBold.ttf?url';
import manrope700 from '@expo-google-fonts/manrope/700Bold/Manrope_700Bold.ttf?url';
import spaceGrotesk600 from '@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf?url';
import spaceGrotesk700 from '@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf?url';

import { GgastosFonts } from '@/shared/theme/ggastos-theme';

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
    const face = new FontFace(family, `url(${url})`);
    await face.load();
    document.fonts.add(face);
  });

  return Promise.all(loads);
}
