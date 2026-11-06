/**
 * GGastos design tokens, ported from the Claude Design project
 * (tokens/colors.css, typography.css, spacing.css).
 */

export const GgastosColors = {
  bgBase: '#F7F2EA',
  bgSurface: '#FFFDFC',
  bgSurfaceRaised: '#FFFFFF',
  inkStrong: '#1F1A17',
  inkSoft: '#5E554D',
  inkFaint: '#9A8F84',
  lineSoft: '#DDD3C7',
  lineSofter: '#EAE2D6',

  brandPrimary: '#1F6B57',
  brandPrimaryDark: '#16503F',
  brandPrimarySoft: '#DCEEE7',
  brandPrimarySofter: '#EDF6F2',

  expense: '#C65A46',
  expenseSoft: '#F6E0DA',
  income: '#2F8A57',
  incomeSoft: '#E1F0E5',
  investment: '#356FA8',
  investmentSoft: '#DEEAF4',
  transfer: '#7A7A74',
  transferSoft: '#EAE8E3',
  warning: '#C28A2C',
  warningSoft: '#F5E7CE',

  statusPlanejadoBg: '#EDE8E1',
  statusPlanejadoFg: '#5E554D',
  statusRealizadoBg: '#DCEEE7',
  statusRealizadoFg: '#1F6B57',
  statusPendenteBg: '#F5E7CE',
  statusPendenteFg: '#8A6416',
  statusAutoBg: '#D9EEEA',
  statusAutoFg: '#1E6E63',
  statusManualBg: '#DEEAF4',
  statusManualFg: '#2C5C87',
  statusCanceladoBg: '#EAE4DC',
  statusCanceladoFg: '#837A70',
} as const;

export type EntryKind = 'despesa' | 'receita' | 'investimento' | 'transferencia';

export const KindColors: Record<EntryKind, string> = {
  despesa: GgastosColors.expense,
  receita: GgastosColors.income,
  investimento: GgastosColors.investment,
  transferencia: GgastosColors.transfer,
};

export type StatusChipStatus =
  | 'PLANEJADO'
  | 'REALIZADO'
  | 'PENDENTE'
  | 'CONCILIADO AUTO'
  | 'CONCILIADO MANUAL'
  | 'CANCELADO';

export const StatusChipColors: Record<StatusChipStatus, { bg: string; fg: string }> = {
  PLANEJADO: { bg: GgastosColors.statusPlanejadoBg, fg: GgastosColors.statusPlanejadoFg },
  REALIZADO: { bg: GgastosColors.statusRealizadoBg, fg: GgastosColors.statusRealizadoFg },
  PENDENTE: { bg: GgastosColors.statusPendenteBg, fg: GgastosColors.statusPendenteFg },
  'CONCILIADO AUTO': { bg: GgastosColors.statusAutoBg, fg: GgastosColors.statusAutoFg },
  'CONCILIADO MANUAL': { bg: GgastosColors.statusManualBg, fg: GgastosColors.statusManualFg },
  CANCELADO: { bg: GgastosColors.statusCanceladoBg, fg: GgastosColors.statusCanceladoFg },
};

export const GgastosFonts = {
  display: 'SpaceGrotesk_700Bold',
  displaySemibold: 'SpaceGrotesk_600SemiBold',
  body: 'Manrope_500Medium',
  bodySemibold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export const GgastosType = {
  displayXl: { fontFamily: GgastosFonts.display, fontSize: 44, lineHeight: 46 },
  displayLg: { fontFamily: GgastosFonts.display, fontSize: 34, lineHeight: 37 },
  displayMd: { fontFamily: GgastosFonts.displaySemibold, fontSize: 26, lineHeight: 30 },
  displaySm: { fontFamily: GgastosFonts.displaySemibold, fontSize: 20, lineHeight: 24 },
  bodyLg: { fontFamily: GgastosFonts.body, fontSize: 17, lineHeight: 25 },
  bodyMd: { fontFamily: GgastosFonts.body, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: GgastosFonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: GgastosFonts.bodySemibold, fontSize: 12, lineHeight: 16 },
  labelCaps: {
    fontFamily: GgastosFonts.bodyBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.7,
    textTransform: 'uppercase' as const,
  },
  micro: { fontFamily: GgastosFonts.body, fontSize: 11, lineHeight: 14 },
} as const;

export const GgastosSpacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space7: 32,
  space8: 40,
  space9: 48,
  space10: 64,
} as const;

export const GgastosRadius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const GgastosShadow = {
  card: {
    shadowColor: '#1F1A17',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#1F1A17',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
} as const;
