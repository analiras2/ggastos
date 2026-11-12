import { describe, expect, it } from 'vitest';

import { parseTagsInput } from '@/shared/lib/parse-tags';

describe('parseTagsInput', () => {
  it('splits on spaces and keeps accents', () => {
    expect(parseTagsInput('#irmã #eletronico')).toEqual(['#irmã', '#eletronico']);
  });

  it('drops words without the hash and empty input', () => {
    expect(parseTagsInput('viagem #ok  ')).toEqual(['#ok']);
    expect(parseTagsInput('')).toEqual([]);
  });

  it('removes repeated tags', () => {
    expect(parseTagsInput('#a #a #b')).toEqual(['#a', '#b']);
  });
});
