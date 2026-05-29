/**
 * Generate a URL-safe slug from a string.
 * Handles Japanese characters by allowing them through (for Japanese URLs),
 * but also provides an ASCII-only mode for product codes.
 */
export function toSlug(input: string, asciiOnly = false): string {
  let slug = input.toLowerCase().trim()

  if (asciiOnly) {
    slug = slug
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  } else {
    slug = slug
      .replace(/[\s_]+/g, '-')
      .replace(/[^\p{L}\p{N}\-]/gu, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return slug
}

/** Validate that a slug matches MYKENKO URL conventions */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9][a-z0-9\-]*[a-z0-9]$/.test(slug)
}
