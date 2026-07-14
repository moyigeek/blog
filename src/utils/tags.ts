/**
 * Slugify a tag name for use in URLs.
 * Handles special characters like colons, slashes, etc.
 */
export function slugifyTag(tag: string): string {
  return tag
    .replace(/[:/]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\-_.]/g, '')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

/**
 * Get all unique tags from posts, with their slug and count.
 */
export async function getAllTags(posts: { data: { tags: string[] } }[]) {
  const tagMap = new Map<string, { name: string; slug: string; count: number }>();

  posts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      const slug = slugifyTag(tag);
      if (tagMap.has(slug)) {
        tagMap.get(slug)!.count++;
      } else {
        tagMap.set(slug, { name: tag, slug, count: 1 });
      }
    });
  });

  return Array.from(tagMap.values()).sort((a, b) => b.count - a.count);
}
