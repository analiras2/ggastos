import { describe, expect, it } from 'vitest';

import { collectTags, matchesSearchItem } from '@/features/search/filter-search-items';

describe('collectTags', () => {
  it('lists each tag once, sorted', () => {
    expect(collectTags([{ tags: ['#pet', '#casa'] }, { tags: ['#casa'] }, { tags: [] }])).toEqual(['#casa', '#pet']);
  });
});

describe('matchesSearchItem', () => {
  const item = { tags: ['#pet', '#casa'] };

  it('finds by title or by tag, ignoring accents and the hash', () => {
    expect(matchesSearchItem(item, 'Ração', 'racao', null)).toBe(true);
    expect(matchesSearchItem(item, 'Outro', 'pet', null)).toBe(true);
    expect(matchesSearchItem(item, 'Outro', 'viagem', null)).toBe(false);
  });

  it('shows everything with the chosen tag when there is no query', () => {
    expect(matchesSearchItem(item, 'Outro', '', '#pet')).toBe(true);
    expect(matchesSearchItem(item, 'Outro', '', '#viagem')).toBe(false);
  });

  it('shows nothing with neither query nor tag', () => {
    expect(matchesSearchItem(item, 'Outro', '', null)).toBe(false);
  });

  it('combines the tag with the query', () => {
    expect(matchesSearchItem(item, 'Ração', 'racao', '#pet')).toBe(true);
    expect(matchesSearchItem(item, 'Outro', 'racao', '#pet')).toBe(false);
  });
});
