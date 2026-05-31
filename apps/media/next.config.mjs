import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.mykenko.jp' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  async redirects() {
    return [
      // 旧URLリダイレクト 例
      // { source: '/symptom/:slug', destination: '/symptoms/:slug/', permanent: true },
    ]
  },
}

export default withPayload(nextConfig)
