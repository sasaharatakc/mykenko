'use client'

import { useState } from 'react'
import Link from 'next/link'
import { generateBreadcrumbJsonLd } from '@mykenko/seo'

const QUESTIONS = [
  {
    id: 1,
    text: '頭頂部・前頭部の髪が薄くなってきたと感じますか？',
    options: [
      { value: 3, label: 'はっきり気になる' },
      { value: 2, label: 'やや気になる' },
      { value: 1, label: 'あまり気にならない' },
      { value: 0, label: '変化を感じない' },
    ],
  },
  {
    id: 2,
    text: '家族（父・祖父・兄弟など）に薄毛の方はいますか？',
    options: [
      { value: 3, label: '複数いる' },
      { value: 2, label: '1人いる' },
      { value: 1, label: 'わからない' },
      { value: 0, label: 'いない' },
    ],
  },
  {
    id: 3,
    text: '最近1年間で抜け毛が増えたと感じますか？',
    options: [
      { value: 3, label: '明らかに増えた' },
      { value: 2, label: 'やや増えた気がする' },
      { value: 1, label: 'よくわからない' },
      { value: 0, label: '変化なし' },
    ],
  },
  {
    id: 4,
    text: '頭皮のかゆみ・フケ・べたつきはありますか？',
    options: [
      { value: 2, label: 'よくある' },
      { value: 1, label: 'ときどきある' },
      { value: 0, label: 'ほとんどない' },
    ],
  },
  {
    id: 5,
    text: '現在のストレスや睡眠不足の状態は？',
    options: [
      { value: 2, label: '慢性的に感じている' },
      { value: 1, label: 'ときどき感じる' },
      { value: 0, label: 'あまり感じない' },
    ],
  },
]

type ResultLevel = 'low' | 'medium' | 'high'

function getResult(score: number): {
  level: ResultLevel
  title: string
  message: string
} {
  if (score <= 3) {
    return {
      level: 'low',
      title: '現時点での懸念は少ない可能性があります',
      message:
        '現時点でのセルフチェック結果は懸念が少ない傾向です。ただし、セルフチェックは医学的診断ではありません。気になる症状がある場合は専門医にご相談ください。',
    }
  }
  if (score <= 7) {
    return {
      level: 'medium',
      title: '早めの専門家への相談をご検討ください',
      message:
        'いくつかの気になる項目が見られます。AGAは早期対応が重要とされています。本結果は医学的診断ではありません。詳しくは皮膚科・専門クリニックでご相談ください。',
    }
  }
  return {
    level: 'high',
    title: '専門医への相談をお勧めします',
    message:
      '複数の気になる項目があります。AGAの可能性を含め、専門医への相談をご検討ください。本セルフチェックは医学的診断ではなく、治療効果を保証するものではありません。',
  }
}

const LEVEL_STYLES: Record<ResultLevel, string> = {
  low: 'border-green-400 bg-green-50',
  medium: 'border-yellow-400 bg-yellow-50',
  high: 'border-red-400 bg-red-50',
}

const LEVEL_BADGE: Record<ResultLevel, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

const breadcrumb = generateBreadcrumbJsonLd([
  { name: 'ホーム', url: 'https://mykenko.jp/' },
  { name: 'AGAセルフチェック', url: 'https://mykenko.jp/lp/aga-selfcheck/' },
])

export default function AgaSelfCheckPage() {
  const [step, setStep] = useState<number>(0) // 0 = intro, 1-5 = questions, 6 = result
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [selected, setSelected] = useState<number | null>(null)

  const totalSteps = QUESTIONS.length
  const isIntro = step === 0
  const isResult = step === totalSteps + 1
  const currentQuestion = QUESTIONS[step - 1]

  const score = Object.values(answers).reduce((a, b) => a + b, 0)
  const result = getResult(score)

  function handleNext() {
    if (isIntro) {
      setStep(1)
      return
    }
    if (selected === null) return
    setAnswers((prev) => ({ ...prev, [step]: selected }))
    setSelected(null)
    if (step === totalSteps) {
      setStep(totalSteps + 1)
    } else {
      setStep((s) => s + 1)
    }
  }

  function handleRestart() {
    setStep(0)
    setAnswers({})
    setSelected(null)
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-10 px-4">
        <div className="max-w-xl mx-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-primary">ホーム</Link>
            {' > '}AGAセルフチェック
          </nav>

          {/* Disclaimer banner */}
          <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 text-xs text-amber-700 mb-6">
            ※ 本セルフチェックは医学的診断ではありません。結果はあくまで参考情報であり、効果・治療を保証するものではありません。症状が気になる場合は必ず医師・専門家にご相談ください。
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
            {/* Intro */}
            {isIntro && (
              <div className="text-center">
                <span className="text-6xl mb-4 block">💈</span>
                <h1 className="text-2xl font-bold text-primary mb-3">AGAセルフチェック</h1>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  5つの質問に答えるだけで、AGAの傾向をセルフチェックできます。
                  所要時間は約1分です。
                </p>
                <button
                  onClick={handleNext}
                  className="btn-primary w-full text-base py-3"
                >
                  チェックを始める
                </button>
              </div>
            )}

            {/* Questions */}
            {!isIntro && !isResult && currentQuestion && (
              <div>
                {/* Progress */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>質問 {step} / {totalSteps}</span>
                  <span>{Math.round((step / totalSteps) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>

                <h2 className="text-base font-bold text-gray-800 mb-5">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(opt.value)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selected === opt.value
                          ? 'border-primary bg-primary-50 text-primary'
                          : 'border-gray-200 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  disabled={selected === null}
                  className="btn-primary w-full mt-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === totalSteps ? '結果を見る' : '次へ'}
                </button>
              </div>
            )}

            {/* Result */}
            {isResult && (
              <div>
                <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
                  チェック結果
                </h2>

                <div className={`border-2 rounded-xl p-5 mb-6 ${LEVEL_STYLES[result.level]}`}>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${LEVEL_BADGE[result.level]}`}>
                    スコア: {score}点
                  </span>
                  <p className="font-bold text-gray-800 mt-3 mb-2">{result.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.message}</p>
                </div>

                {/* CTA */}
                <div className="bg-primary-50 rounded-xl p-5 mb-5 text-center">
                  <p className="text-sm font-bold text-primary mb-1">AGA関連成分を詳しく調べる</p>
                  <p className="text-xs text-gray-500 mb-3">
                    フィナステリド・ミノキシジルなど科学的根拠に基づく成分情報
                  </p>
                  <Link
                    href="/symptoms/aga/"
                    className="btn-primary inline-block text-sm px-6 py-2"
                  >
                    AGA症状ページを見る
                  </Link>
                </div>

                <div className="text-center mb-4">
                  <a
                    href="https://shop.mykenko.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary-50 transition-colors text-sm"
                  >
                    MYKENKOショップで商品を探す →
                  </a>
                </div>

                <button
                  onClick={handleRestart}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 underline"
                >
                  もう一度チェックする
                </button>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 mt-4 text-center leading-relaxed">
                  本結果は医学的診断ではありません。AGAの治療効果を保証するものでも、特定の製品を推奨するものでもありません。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
