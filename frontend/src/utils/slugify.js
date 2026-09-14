/**
 * Omnidesk BD Slug Utility
 * Generates and matches clean, human-readable URL slugs for StudySpaces & Projects.
 */

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove non-alphanumeric chars except space and hyphen
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-');         // Collapse multiple hyphens
};

export const matchesSlug = (space, targetSlug) => {
  if (!space || !targetSlug) return false;
  const cleanTarget = targetSlug.toString().toLowerCase().trim();
  
  // 1. Direct UUID or string ID match
  if (space.id && space.id.toString().toLowerCase() === cleanTarget) {
    return true;
  }

  // 2. Explicit slug match if available
  if (space.slug && space.slug.toLowerCase() === cleanTarget) {
    return true;
  }

  // 3. Computed slug from title
  const computedSlug = slugify(space.title);
  if (computedSlug && computedSlug === cleanTarget) {
    return true;
  }

  // 4. Normalized title match (alphanumeric only)
  const normalizedTitle = (space.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedTarget = cleanTarget.replace(/[^a-z0-9]/g, '');
  if (normalizedTitle && normalizedTarget && normalizedTitle === normalizedTarget) {
    return true;
  }

  return false;
};

export const getSpaceSlug = (space) => {
  if (!space) return '';
  if (space.slug) return space.slug;
  const slug = slugify(space.title);
  return slug || space.id || '';
};
