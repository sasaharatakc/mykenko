/** Format a date as YYYY-MM-DD (JST-aware display) */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  }).replace(/\//g, '-')
}

/** Return ISO 8601 string for a date (for sitemap lastmod etc.) */
export function toIsoString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}
