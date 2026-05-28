import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
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
