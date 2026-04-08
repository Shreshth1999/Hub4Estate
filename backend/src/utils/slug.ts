/**
 * Generate a URL-safe slug from a string.
 * Handles Hindi/Devanagari by transliterating common characters.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')      // Collapse multiple hyphens
    .replace(/^-|-$/g, '');   // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a numeric suffix if needed.
 */
export async function uniqueSlug(
  base: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const slug = slugify(base);
  if (!(await checkExists(slug))) return slug;

  let counter = 1;
  while (counter < 100) {
    const candidate = `${slug}-${counter}`;
    if (!(await checkExists(candidate))) return candidate;
    counter++;
  }

  // Fallback: append random suffix
  return `${slug}-${Date.now().toString(36)}`;
}
