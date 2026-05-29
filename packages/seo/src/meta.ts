/**
 * Meta tag helpers for Next.js Metadata API
 */

export function buildTitle(pageTitle: string, siteName = 'MYKENKO'): string {
  return `${pageTitle} | ${siteName}`
}

export function buildDescription(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

export function buildCanonicalUrl(path: string, base = 'https://mykenko.jp'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const withTrailing = normalized.endsWith('/') ? normalized : `${normalized}/`
  return `${base}${withTrailing}`
}

export function buildOgImageUrl(path: string, base = 'https://mykenko.jp'): string {
  return `${base}/og${path}`
}
