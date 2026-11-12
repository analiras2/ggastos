import { matchesSearch } from '@/shared/lib/search-text';

type Taggable = { tags: string[] };

// Every tag used in the month, once, in alphabetical order.
export function collectTags(items: Taggable[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((first, second) => first.localeCompare(second, 'pt-BR'));
}

// An item matches when its title or one of its tags has the query; a chosen tag narrows it further.
export function matchesSearchItem(
  item: Taggable,
  title: string,
  normalizedQuery: string,
  selectedTag: string | null
): boolean {
  if (selectedTag !== null && !item.tags.includes(selectedTag)) {
    return false;
  }
  if (normalizedQuery.length === 0) {
    return selectedTag !== null;
  }
  return matchesSearch(title, normalizedQuery) || item.tags.some((tag) => matchesSearch(tag, normalizedQuery));
}
