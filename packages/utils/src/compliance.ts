/**
 * 薬機法・景表法コンプライアンス ユーティリティ
 *
 * ⚠️ これらの関数はサーバーサイドでの最終審査を補完するものです。
 *    完全な法的審査の代替にはなりません。
 */

/** 効果保証に該当する可能性のあるフレーズ */
const PROHIBITED_GUARANTEE_PHRASES = [
  '必ず効く',
  '絶対に',
  '100%',
  '確実に治る',
  '完治',
  '副作用なし',
  '副作用がない',
  '医師いらず',
] as const

/** 医療広告ガイドラインで注意が必要なフレーズ */
const CAUTION_PHRASES = [
  '治療',
  '治癒',
  '治す',
  '予防できる',
  '改善する',
  '効果がある',
] as const

export interface ComplianceCheckResult {
  isProhibited: boolean
  isCaution: boolean
  prohibitedMatches: string[]
  cautionMatches: string[]
}

/**
 * コンテンツテキストに薬機法上の問題フレーズが含まれていないかチェックする。
 * サーバーサイドでの使用を想定。
 */
export function checkCompliance(text: string): ComplianceCheckResult {
  const prohibitedMatches = PROHIBITED_GUARANTEE_PHRASES.filter((phrase) =>
    text.includes(phrase)
  )
  const cautionMatches = CAUTION_PHRASES.filter((phrase) => text.includes(phrase))

  return {
    isProhibited: prohibitedMatches.length > 0,
    isCaution: cautionMatches.length > 0,
    prohibitedMatches,
    cautionMatches,
  }
}

/** 薬機法遵守の免責表現を付加する */
export function appendDisclaimer(text: string): string {
  return `${text}\n\n※本情報は一般的な情報提供を目的としており、効果を保証するものではありません。個人の症状や体質により異なります。購入・使用前に必ず医師・薬剤師にご相談ください。`
}
