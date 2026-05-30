import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import path from 'path'

import { Symptoms } from './collections/Symptoms'
import { Ingredients } from './collections/Ingredients'
import { Authors } from './collections/Authors'
import { Media } from './collections/Media'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'dev-secret-change-me',
  serverURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— MYKENKO CMS',
    },
  },

  editor: lexicalEditor({}),

  collections: [
    Symptoms,
    Ingredients,
    Authors,
    Media,
    // Users collection (built-in auth)
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: '氏名',
        },
        {
          name: 'role',
          type: 'select',
          label: 'ロール',
          defaultValue: 'editor',
          options: [
            { label: '管理者', value: 'admin' },
            { label: '編集者', value: 'editor' },
            { label: '閲覧者', value: 'viewer' },
          ],
        },
      ],
    },
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),

  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM ?? 'noreply@mykenko.jp',
          defaultFromName: 'MYKENKO CMS',
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          },
        }),
      }
    : {}),

  upload: {
    limits: {
      fileSize: 5_000_000, // 5MB
    },
  },

  typescript: {
    outputFile: path.resolve(process.cwd(), 'payload-types.ts'),
  },

  graphQL: {
    disable: false,
    schemaOutputFile: path.resolve(process.cwd(), 'payload-schema.graphql'),
  },

  localization: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    fallback: true,
  },
})
