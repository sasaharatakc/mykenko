import type { CollectionConfig } from 'payload'
import { upsertSymptom } from '../../lib/meilisearch'

export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  admin: {
    useAsTitle: 'nameJa',
    defaultColumns: ['nameJa', 'slug', 'severity', 'isPublished', 'updatedAt'],
    group: 'コンテンツ',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.isPublished && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        await upsertSymptom({
          id: String(doc.id),
          slug: doc.slug,
          nameJa: doc.nameJa,
          nameEn: doc.nameEn ?? null,
          descriptionJa: doc.descriptionJa ?? null,
          isPublished: doc.isPublished ?? false,
        })
      },
    ],
  },
  fields: [
    // ── 基本情報 ──────────────────────────────────────
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL スラッグ（例: aga, insomnia）。英小文字・ハイフンのみ。',
      },
      validate: (val: string | null | undefined) => {
        if (!val) return '必須項目です'
        if (!/^[a-z0-9][a-z0-9\-]*[a-z0-9]$/.test(val)) {
          return '英小文字・数字・ハイフンのみ使用できます'
        }
        return true
      },
    },
    {
      name: 'nameJa',
      label: '症状名（日本語）',
      type: 'text',
      required: true,
    },
    {
      name: 'nameEn',
      label: '症状名（英語）',
      type: 'text',
    },
    {
      name: 'icdCode',
      label: 'ICD-10 コード',
      type: 'text',
      admin: {
        description: '例: L64, G47.0',
      },
    },
    {
      name: 'severity',
      label: '重症度',
      type: 'select',
      options: [
        { label: '軽度 (mild)', value: 'mild' },
        { label: '中程度 (moderate)', value: 'moderate' },
        { label: '重度 (severe)', value: 'severe' },
      ],
    },
    {
      name: 'bodySystems',
      label: '関連する体の部位・系統',
      type: 'array',
      fields: [
        {
          name: 'system',
          type: 'text',
          required: true,
        },
      ],
    },

    // ── コンテンツ ────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: '概要',
          fields: [
            {
              name: 'descriptionJa',
              label: '症状の説明',
              type: 'richText',
              admin: {
                description: '⚠️ 薬機法注意: 効果保証・治療を謳う表現は禁止。一般的な情報提供に留めること。',
              },
            },
            {
              name: 'mechanism',
              label: 'メカニズム（原因・仕組み）',
              type: 'richText',
            },
            {
              name: 'faqs',
              label: 'よくある質問 (FAQ)',
              type: 'array',
              fields: [
                { name: 'question', label: '質問', type: 'text', required: true },
                { name: 'answer', label: '回答', type: 'textarea', required: true },
              ],
              admin: {
                description: 'FAQPage JSON-LD に自動反映されます。',
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoTitle',
              label: 'SEO タイトル',
              type: 'text',
              admin: {
                description: '未入力時は nameJa から自動生成。120文字以内推奨。',
              },
            },
            {
              name: 'seoDescription',
              label: 'META description',
              type: 'textarea',
              admin: {
                description: '155文字以内推奨。',
              },
            },
            {
              name: 'ogImage',
              label: 'OGP 画像',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: '関連',
          fields: [
            {
              name: 'relatedIngredients',
              label: '関連成分',
              type: 'relationship',
              relationTo: 'ingredients',
              hasMany: true,
              admin: {
                description: '症状ページの「関連成分」セクションに表示されます。',
              },
            },
            {
              name: 'relatedSymptoms',
              label: '関連症状',
              type: 'relationship',
              relationTo: 'symptoms',
              hasMany: true,
            },
            {
              name: 'authors',
              label: '監修者',
              type: 'relationship',
              relationTo: 'authors',
              hasMany: true,
            },
          ],
        },
      ],
    },

    // ── 公開設定 ──────────────────────────────────────
    {
      name: 'isPublished',
      label: '公開',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: '公開日時',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  timestamps: true,
}
