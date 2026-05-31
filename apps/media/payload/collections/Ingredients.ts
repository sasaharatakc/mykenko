import type { CollectionConfig } from 'payload'
import { upsertIngredient } from '../../lib/meilisearch'

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  admin: {
    useAsTitle: 'nameJa',
    defaultColumns: ['nameJa', 'slug', 'evidenceLevel', 'isPublished', 'updatedAt'],
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
        await upsertIngredient({
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
        description: 'URL スラッグ（例: finasteride, zinc）。英小文字・ハイフンのみ。',
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
      label: '成分名（日本語）',
      type: 'text',
      required: true,
    },
    {
      name: 'nameEn',
      label: '成分名（英語）',
      type: 'text',
    },
    {
      name: 'casNumber',
      label: 'CAS 番号',
      type: 'text',
      admin: {
        description: '例: 98319-26-7',
      },
    },
    {
      name: 'evidenceLevel',
      label: '証拠レベル',
      type: 'select',
      options: [
        { label: 'A — 強い証拠あり（RCT複数）', value: 'A' },
        { label: 'B — 中程度の証拠あり', value: 'B' },
        { label: 'C — 弱い証拠・伝統的使用', value: 'C' },
      ],
      admin: {
        description: '⚠️ 景表法注意: 証拠レベルAでも効果を断言してはいけません。',
      },
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
              label: '成分の説明',
              type: 'richText',
              admin: {
                description: '⚠️ 薬機法注意: 「〇〇を治療する」「必ず効く」などの表現は禁止。',
              },
            },
            {
              name: 'mechanism',
              label: '作用メカニズム',
              type: 'richText',
            },
            {
              name: 'safetyNotes',
              label: '安全性・注意事項',
              type: 'richText',
              admin: {
                description: '副作用・禁忌・相互作用など。必ず「医師にご相談ください」で締めること。',
              },
            },
            {
              name: 'faqs',
              label: 'よくある質問 (FAQ)',
              type: 'array',
              fields: [
                { name: 'question', label: '質問', type: 'text', required: true },
                { name: 'answer', label: '回答', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: '研究・エビデンス',
          fields: [
            {
              name: 'studies',
              label: '参照研究',
              type: 'array',
              fields: [
                { name: 'title', label: '論文タイトル', type: 'text', required: true },
                { name: 'url', label: 'URL (PubMed等)', type: 'text' },
                { name: 'year', label: '発表年', type: 'number' },
                { name: 'summary', label: '要約（一般的な情報として）', type: 'textarea' },
              ],
              admin: {
                description: 'E-E-A-T向上のため引用を記載してください。',
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
            },
            {
              name: 'seoDescription',
              label: 'META description',
              type: 'textarea',
              admin: { description: '155文字以内推奨。' },
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
              name: 'relatedSymptoms',
              label: '効果が研究されている症状',
              type: 'relationship',
              relationTo: 'symptoms',
              hasMany: true,
              admin: {
                description: '⚠️ 表示時は「〇〇に関する研究があります」程度の表現にすること。',
              },
            },
            {
              name: 'relatedIngredients',
              label: '関連成分',
              type: 'relationship',
              relationTo: 'ingredients',
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
    {
      name: 'sortOrder',
      label: '表示順',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
