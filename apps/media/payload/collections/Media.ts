import type { CollectionConfig } from 'payload'

/**
 * Media Upload Collection
 * 画像・ファイルのアップロード管理
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'メディア',
    plural: 'メディア一覧',
  },
  admin: {
    description: '画像・ファイルをアップロードします。',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'public/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt テキスト',
      admin: {
        description: 'アクセシビリティのため必ず入力してください',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'キャプション',
    },
  ],
}
