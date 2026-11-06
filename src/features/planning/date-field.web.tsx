import type { ChangeEvent, CSSProperties } from 'react';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatDateToIso } from '@/features/planning/planning-form-utils';

type DateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(isoDate: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function DateField({ value, onChange }: DateFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDate = parseIsoDate(event.target.value);
    if (nextDate) {
      onChange(nextDate);
    }
  }

  return (
    <input
      aria-label="Selecionar data"
      onChange={handleChange}
      style={inputStyle}
      type="date"
      value={value ? formatDateToIso(value) : ''}
    />
  );
}

const inputStyle: CSSProperties = {
  boxSizing: 'border-box',
  width: '100%',
  border: `1px solid ${GgastosColors.lineSoft}`,
  borderRadius: GgastosRadius.md,
  padding: `${GgastosSpacing.space3}px ${GgastosSpacing.space4}px`,
  backgroundColor: GgastosColors.bgSurface,
  color: GgastosColors.inkStrong,
  fontFamily: GgastosType.bodyMd.fontFamily,
  fontSize: GgastosType.bodyMd.fontSize,
};
