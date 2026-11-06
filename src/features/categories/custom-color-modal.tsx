import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Button } from '@/components/ggastos/core/button';
import { hexToHsv, hsvToHex, isValidHex, type Hsv } from '@/constants/color-utils';
import { GgastosColors, GgastosRadius, GgastosShadow, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { BrightnessSlider } from '@/features/categories/brightness-slider';
import { ColorWheel } from '@/features/categories/color-wheel';

const MAX_WHEEL_SIZE = 260;
const CARD_HORIZONTAL_SPACE = GgastosSpacing.space5 * 4;
const PREVIEW_SIZE = 36;
const HEX_MAX_LENGTH = 7;
const BACKDROP_COLOR = 'rgba(31, 26, 23, 0.4)';

type CustomColorModalProps = {
  visible: boolean;
  initialColor: string;
  onConfirm: (color: string) => void;
  onClose: () => void;
};

export function CustomColorModal({ visible, initialColor, onConfirm, onClose }: CustomColorModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <Pressable accessibilityLabel="Fechar" style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.card}>
            {visible ? <CustomColorSheet initialColor={initialColor} onConfirm={onConfirm} onCancel={onClose} /> : null}
          </Pressable>
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

type CustomColorSheetProps = { initialColor: string; onConfirm: (color: string) => void; onCancel: () => void };

// Mounted only while the modal is open so every opening starts from the current color.
function CustomColorSheet({ initialColor, onConfirm, onCancel }: CustomColorSheetProps) {
  const { width } = useWindowDimensions();
  const wheelSize = Math.min(width - CARD_HORIZONTAL_SPACE, MAX_WHEEL_SIZE);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(initialColor));
  const [hexText, setHexText] = useState(initialColor.toUpperCase());

  const currentColor = hsvToHex(hsv);

  function applyHsv(next: Hsv) {
    setHsv(next);
    setHexText(hsvToHex(next));
  }

  function handleHexChange(text: string) {
    const normalized = `#${text.replace(/[^0-9a-fA-F]/g, '').toUpperCase()}`;
    setHexText(normalized);
    if (isValidHex(normalized)) setHsv(hexToHsv(normalized));
  }

  return (
    <>
      <Text style={styles.title}>Cor personalizada</Text>
      <View style={styles.center}>
        <ColorWheel
          size={wheelSize}
          hue={hsv.hue}
          saturation={hsv.saturation}
          value={hsv.value}
          onChange={(hue, saturation) => applyHsv({ ...hsv, hue, saturation })}
        />
      </View>
      <View style={styles.center}>
        <BrightnessSlider
          width={wheelSize}
          brightColor={hsvToHex({ ...hsv, value: 1 })}
          value={hsv.value}
          onChange={(value) => applyHsv({ ...hsv, value })}
        />
      </View>
      <View style={styles.hexRow}>
        <View style={[styles.preview, { backgroundColor: currentColor }]} />
        <TextInput
          accessibilityLabel="Código da cor"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={HEX_MAX_LENGTH}
          onChangeText={handleHexChange}
          style={styles.hexInput}
          value={hexText}
        />
      </View>
      <Button fullWidth disabled={!isValidHex(hexText)} onPress={() => onConfirm(currentColor)}>Usar esta cor</Button>
      <Button fullWidth variant="ghost" onPress={onCancel}>Cancelar</Button>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: GgastosSpacing.space5,
  },
  card: {
    width: '100%',
    maxWidth: MAX_WHEEL_SIZE + GgastosSpacing.space5 * 2,
    gap: GgastosSpacing.space4,
    padding: GgastosSpacing.space5,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    ...GgastosShadow.card,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  center: { alignItems: 'center' },
  hexRow: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3 },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
  },
  hexInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
});
