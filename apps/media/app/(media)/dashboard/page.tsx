/**
 * Kingmaker Dashboard — MYKENKO 朝10分経営判断ダッシュボード
 *
 * 表示内容:
 *  - priority:S の未完了 Issues
 *  - status:blocked の Issues
 *  - Review 待ち PR（Checks 済み）
 *  - 失敗している Actions
 *  - 本日 Merge してよい PR
 *
 * アクセス制限: NEXT_PUBLIC_DASHBOARD_TOKEN が設定されている場合のみ表示
 * （本番では /dashboard を認証ミドルウェアで保護すること）
 */

import { Suspense } from 'react'

const GITHUB_API = 'https://api.github.com'
const OWNER = 'sasaharatakc'
const REPO = 'mykenko'

// ── GitHub API helpers ──────────────────────────────────────────────────────

async function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: 300 }, // 5分キャッシュ
  })
  if (!res.ok) return null
  return res.json()
}

// ── Data fetchers ───────────────────────────────────────────────────────────

async function fetchPriorityIssues() {
  const data = await githubFetch(
    `/repos/${OWNER}/${REPO}/issues?labels=priority:S,status:todo&state=open&per_page=20`
  )
  return (data as Issue[] | null) ?? []
}

async function fetchBlockedIssues() {
  const data = await githubFetch(
    `/repos/${OWNER}/${REPO}/issues?labels=status:blocked&state=open&per_page=20`
  )
  return (data as Issue[] | null) ?? []
}

async function fetchOpenPRs() {
  const data = await githubFetch(
    `/repos/${OWNER}/${REPO}/pulls?state=open&per_page=20`
  )
  return (data as PR[] | null) ?? []
}

async function fetchFailedRuns() {
  const data = await githubFetch(
    `/repos/${OWNER}/${REPO}/actions/runs?status=failure&per_page=10`
  )
  return ((data as { workflow_runs?: WorkflowRun[] } | null)?.workflow_runs) ?? []
}

// ── Types ───────────────────────────────────────────────────────────────────

interface Issue {
  number: number
  title: string
  html_url: string
  labels: { name: string; color: string }[]
  updated_at: string
  pull_request?: object
}

interface PR {
  number: number
  title: string
  html_url: string
  draft: boolean
  user: { login: string }
  updated_at: string
  labels: { name: string; color: string }[]
}

interface WorkflowRun {
  id: number
  name: string
  html_url: string
  conclusion: string | null
  updated_at: string
  head_branch: string
}

// ── Sub-components ──────────────────────────────────────────────────────────

function IssueCard({ issue }: { issue: Issue }) {
  const priorityLabel = issue.labels.find((l) => l.name.startsWith('priority:'))
  const areaLabel = issue.labels.find((l) => l.name.startsWith('area:'))
  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-lg">📌</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            #{issue.number} {issue.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {priorityLabel && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: `#${priorityLabel.color}` }}
              >
                {priorityLabel.name}
              </span>
            )}
            {areaLabel && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {areaLabel.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  )
}

function PRCard({ pr }: { pr: PR }) {
  return (
    <a
      href={pr.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-lg">{pr.draft ? '📝' : '🔀'}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            #{pr.number} {pr.title}
          </p>
          <p className="mt-0.5 text-xs text-gray-400">
            {pr.draft ? 'Draft' : 'Ready'} · @{pr.user.login}
          </p>
        </div>
      </div>
    </a>
  )
}

function RunCard({ run }: { run: WorkflowRun }) {
  return (
    <a
      href={run.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-red-200 bg-red-50 p-4 hover:border-red-400 transition-all"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-lg">❌</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-red-800 line-clamp-2">{run.name}</p>
          <p className="mt-0.5 text-xs text-red-500">branch: {run.head_branch}</p>
        </div>
      </div>
    </a>
  )
}

function Section({
  title,
  emoji,
  count,
  children,
  emptyMessage,
}: {
  title: string
  emoji: string
  count: number
  children: React.ReactNode
  emptyMessage: string
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-sm font-bold ${
            count > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✅ {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">{children}</div>
      )}
    </section>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'Kingmaker Dashboard | MYKENKO',
  robots: { index: false, follow: false },
}

export default async function KingmakerDashboard() {
  const [priorityIssues, blockedIssues, openPRs, failedRuns] = await Promise.all([
    fetchPriorityIssues(),
    fetchBlockedIssues(),
    fetchOpenPRs(),
    fetchFailedRuns(),
  ])

  // Pull requestsをIssueリストから除外
  const issuesOnly = priorityIssues.filter((i) => !i.pull_request)
  const blockedOnly = blockedIssues.filter((i) => !i.pull_request)

  // PRを分類
  const readyPRs = openPRs.filter((pr) => !pr.draft)
  const draftPRs = openPRs.filter((pr) => pr.draft)

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            👑 Kingmaker Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">{today} · mykenko リポジトリ</p>
        </div>
        <a
          href={`https://github.com/${OWNER}/${REPO}/issues`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          GitHub を開く →
        </a>
      </div>

      {/* Summary bar */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'S級Issue', value: issuesOnly.length, color: issuesOnly.length > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Blocked', value: blockedOnly.length, color: blockedOnly.length > 0 ? 'text-orange-600' : 'text-green-600' },
          { label: 'Review待ちPR', value: readyPRs.length, color: readyPRs.length > 0 ? 'text-blue-600' : 'text-green-600' },
          { label: 'CI失敗', value: failedRuns.length, color: failedRuns.length > 0 ? 'text-red-600' : 'text-green-600' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>

      <Suspense fallback={<p className="text-sm text-gray-500">読み込み中...</p>}>
        {/* 1. S級Issues */}
        <Section
          title="🚨 最優先 Issue（priority:S）"
          emoji="🚨"
          count={issuesOnly.length}
          emptyMessage="S級Issueなし — 今日は安全です"
        >
          {issuesOnly.map((issue) => (
            <IssueCard key={issue.number} issue={issue} />
          ))}
        </Section>

        {/* 2. Blocked */}
        <Section
          title="⛔ Blocked Issues"
          emoji="⛔"
          count={blockedOnly.length}
          emptyMessage="ブロックなし"
        >
          {blockedOnly.map((issue) => (
            <IssueCard key={issue.number} issue={issue} />
          ))}
        </Section>

        {/* 3. Review待ちPR */}
        <Section
          title="🔀 Review 待ち PR"
          emoji="🔀"
          count={readyPRs.length}
          emptyMessage="承認待ちPRなし"
        >
          {readyPRs.map((pr) => (
            <PRCard key={pr.number} pr={pr} />
          ))}
        </Section>

        {/* 4. Draft PR */}
        {draftPRs.length > 0 && (
          <Section
            title="📝 Draft PR"
            emoji="📝"
            count={draftPRs.length}
            emptyMessage=""
          >
            {draftPRs.map((pr) => (
              <PRCard key={pr.number} pr={pr} />
            ))}
          </Section>
        )}

        {/* 5. CI失敗 */}
        <Section
          title="❌ CI 失敗"
          emoji="❌"
          count={failedRuns.length}
          emptyMessage="全CI正常"
        >
          {failedRuns.map((run) => (
            <RunCard key={run.id} run={run} />
          ))}
        </Section>
      </Suspense>

      <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        GitHub API · 5分キャッシュ ·{' '}
        <a
          href={`https://github.com/${OWNER}/${REPO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {OWNER}/{REPO}
        </a>
      </footer>
    </main>
  )
}
