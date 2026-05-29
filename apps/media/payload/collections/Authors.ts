import type { CollectionConfig } from 'payload'

/**
 * Authors / Experts Collection
 * E-E-A-T 対応: 著者・専門家プロフィールを管理
 * 薬機法・医療広告GL: 医師・薬剤師資格の明示が信頼性向上に必須
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  labels: {
    singular: '著者・専門家',
    plural: '著者・専門家一覧',
  },
  admin: {
    useAsTitle: 'name',
    description:
      '記事の著者・監修者を管理します。E-E-A-T向上のため、資格・専門分野を必ず入力してください。',
    defaultColumns: ['name', 'title', 'isExpert', 'isVerified'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: '氏名',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'スラッグ (URL用)',
      required: true,
      unique: true,
      admin: {
        description: '英小文字・ハイフンのみ使用可 (例: taro-yamada)',
      },
      validate: (val: string) => {
        if (!val) return '必須項目です'
        if (!/^[a-z0-9-]+$/.test(val)) return '英小文字・数字・ハイフンのみ使用可'
        return true
      },
    },
    {
      name: 'title',
      type: 'text',
      label: '肩書き・職種',
      admin: {
        description: '例: 医師 (内科専門医)、薬剤師、管理栄養士',
      },
    },
    {
      name: 'isExpert',
      type: 'checkbox',
      label: '専門家フラグ',
      defaultValue: false,
      admin: {
        description: '医師・薬剤師・管理栄養士等の有資格者の場合にチェック',
      },
    },
    {
      name: 'isVerified',
      type: 'checkbox',
      label: '資格確認済み',
      defaultValue: false,
      admin: {
        description: '編集部で資格・免許を確認した場合にチェック (E-E-A-T必須)',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'プロフィール',
          fields: [
            {
              name: 'bio',
              type: 'textarea',
              label: '自己紹介・専門分野',
              admin: {
                description:
                  '専門分野、経歴、資格を記載してください。医療広告GLにより誇張表現は禁止です。',
              },
            },
            {
              name: 'credentials',
              type: 'array',
              label: '資格・免許',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: '資格名',
                  required: true,
                  admin: {
                    description: '例: 医師免許、薬剤師免許、管理栄養士',
                  },
                },
                {
                  name: 'issuedBy',
                  type: 'text',
                  label: '発行機関',
                  admin: {
                    description: '例: 厚生労働省、日本医師会',
                  },
                },
                {
                  name: 'year',
                  type: 'number',
                  label: '取得年',
                  min: 1950,
                  max: new Date().getFullYear(),
                },
              ],
            },
            {
              name: 'specialties',
              type: 'array',
              label: '専門分野',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: '専門分野名',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'SNS・外部リンク',
          fields: [
            {
              name: 'websiteUrl',
              type: 'text',
              label: '個人サイト・所属機関URL',
            },
            {
              name: 'twitterUrl',
              type: 'text',
              label: 'X (Twitter) URL',
            },
            {
              name: 'linkedinUrl',
              type: 'text',
              label: 'LinkedIn URL',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seoTitle',
              type: 'text',
              label: 'SEOタイトル',
              admin: {
                description: '60文字以内推奨',
              },
            },
            {
              name: 'seoDescription',
              type: 'textarea',
              label: 'メタディスクリプション',
              admin: {
                description: '120〜160文字推奨',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'avatar',
      type: 'upload',
      label: 'プロフィール画像',
      relationTo: 'media',
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: '公開',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
