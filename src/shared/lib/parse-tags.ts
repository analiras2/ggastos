const TAG_PATTERN = /^#[\p{L}\p{N}_-]+$/u;

// "#irmã #eletronico" -> ["#irmã", "#eletronico"]. Anything that is not a "#word" is dropped.
export function parseTagsInput(input: string): string[] {
  return [...new Set(input.split(/\s+/).filter((tag) => TAG_PATTERN.test(tag)))];
}
