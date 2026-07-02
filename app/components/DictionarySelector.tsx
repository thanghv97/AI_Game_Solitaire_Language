"use client"

import { useEffect, useState } from "react"
import { VocabFile } from "../types"

type Props = {
  onPlay: (vocab: VocabFile, lang: string, level: string) => void
}

const LANG_LABELS: Record<string, string> = {
  en: "English",
  cn: "Chinese",
  jp: "Japanese",
  fr: "French",
  de: "German",
  es: "Spanish",
  kr: "Korean",
}

export default function DictionarySelector({ onPlay }: Props) {
  const [options, setOptions] = useState<Record<string, string[]>>({})
  const [lang, setLang] = useState<string | null>(null)
  const [level, setLevel] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch("/api/dictionaries")
      .then((r) => r.json())
      .then((data: Record<string, string[]>) => {
        setOptions(data)
        const firstLang = Object.keys(data)[0] ?? null
        setLang(firstLang)
        setLevel(firstLang ? data[firstLang][0] ?? null : null)
      })
      .finally(() => setFetching(false))
  }, [])

  const RANDOM = "__random__"

  async function handlePlay() {
    if (!lang || !level) return
    setLoading(true)

    let vocab: VocabFile
    if (level === RANDOM) {
      const allLevels = options[lang] ?? []
      const results = await Promise.all(
        allLevels.map((lv) =>
          fetch(`/api/dictionaries/${lang}/${lv}`).then((r) => r.json() as Promise<VocabFile>)
        )
      )
      vocab = { topics: results.flatMap((v) => v.topics) }
    } else {
      vocab = await fetch(`/api/dictionaries/${lang}/${level}`).then((r) => r.json())
    }

    setLoading(false)
    onPlay(vocab, lang, level)
  }

  const langs = Object.keys(options)
  const levels = lang ? (options[lang] ?? []) : []

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Vocab <span className="text-yellow-400">Solitaire</span>
          </h1>
          <p className="text-slate-400 text-sm">Choose your vocabulary set to play</p>
        </div>

        {fetching ? (
          <div className="text-center text-slate-500 py-8">Loading dictionaries...</div>
        ) : langs.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            No dictionaries found in <code className="text-slate-400">dictionary/</code> folder.
          </div>
        ) : (
          <>
            {/* Language */}
            <div className="mb-6">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Language
              </p>
              <div className="flex gap-2 flex-wrap">
                {langs.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l)
                      setLevel(options[l][0] ?? null)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      lang === l
                        ? "bg-yellow-500 text-slate-900 shadow-yellow-500/30 shadow-md"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {LANG_LABELS[l] ?? l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            {levels.length > 0 && (
              <div className="mb-8">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Level
                </p>
                <div className="flex gap-2 flex-wrap">
                  {levels.map((lv) => (
                    <button
                      key={lv}
                      onClick={() => setLevel(lv)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        level === lv
                          ? "bg-blue-500 text-white shadow-blue-500/30 shadow-md"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {lv.toUpperCase()}
                    </button>
                  ))}
                  {levels.length >= 2 && (
                    <button
                      onClick={() => setLevel(RANDOM)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        level === RANDOM
                          ? "bg-purple-500 text-white shadow-purple-500/30 shadow-md"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      Random
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={handlePlay}
              disabled={!lang || !level || loading}
              className="w-full py-3 rounded-xl font-bold text-lg transition-all
                bg-yellow-500 hover:bg-yellow-400 text-slate-900
                disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Play"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
