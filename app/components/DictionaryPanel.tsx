"use client"

import { useState, useEffect } from "react"
import { Card } from "../types"

type Props = {
  card: Card | null
  lang: string
}

export default function DictionaryPanel({ card, lang }: Props) {
  if (!card) return <HowToPlay />

  if (card.type === "theme") return <ThemeInfo card={card} />

  if (lang === "cn") return <HanziiLookup word={card.word} />

  return <WordLookup word={card.word} />
}

// ── sub-components ────────────────────────────────────────────────

function HowToPlay() {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <PanelHeader icon="📖" label="Dictionary" />
      <div className="flex-1 flex flex-col gap-3 text-slate-500 text-xs">
        <p className="font-semibold text-slate-600">How to play:</p>
        <ul className="space-y-2 leading-relaxed text-slate-500">
          <li>• Drag cards to stack same-topic words</li>
          <li>• Theme card (gold) must be on top to move to Foundation</li>
          <li>• Complete a topic to clear its Foundation slot</li>
          <li>• Double-click any face-up word card to look it up</li>
          <li>• Draw from Stock pile one card at a time</li>
        </ul>
        <div className="mt-2 p-2 rounded bg-slate-100 text-slate-600">
          <p className="font-medium mb-1">Stacking rules:</p>
          <p>✅ word → word (same topic)</p>
          <p>✅ theme → word (same topic)</p>
          <p>✅ any → empty column</p>
          <p>❌ word → theme card</p>
          <p>❌ different topics</p>
        </div>
      </div>
    </div>
  )
}

function ThemeInfo({ card }: { card: Card }) {
  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <PanelHeader icon="🏷️" label="Topic Card" />
      <div className="flex flex-col gap-3">
        <div className="px-3 py-2 rounded-lg border border-yellow-400 bg-yellow-50">
          <p className="text-yellow-700 text-xl font-bold">{card.word}</p>
          <p className="text-yellow-600 text-xs mt-1">Theme / Topic card</p>
        </div>
        <p className="text-slate-500 text-xs">
          Place all same-topic words under this card, then drag the whole stack to a Foundation slot.
        </p>
      </div>
    </div>
  )
}

function WordLookup({ word }: { word: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const src = `/api/proxy/cambridge?word=${encodeURIComponent(word)}`

  // Reset state when word changes
  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [word])

  return (
    <div className="h-full flex flex-col">
      {/* Word header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <span className="text-slate-800 font-bold text-base truncate">{word}</span>
        </div>
        <a
          href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-blue-400 text-xs flex-shrink-0 ml-2"
          title="Open in new tab"
        >
          ↗
        </a>
      </div>

      {/* Iframe area */}
      <div className="flex-1 relative">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-slate-400 text-sm">Loading...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-4">
            <span className="text-slate-500 text-sm text-center">Could not load dictionary</span>
            <a
              href={`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 text-sm underline"
            >
              Open Cambridge Dictionary ↗
            </a>
          </div>
        )}
        <iframe
          key={word}
          src={src}
          title={`Cambridge Dictionary: ${word}`}
          className="w-full h-full border-0"
          style={{ display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    </div>
  )
}

function HanziiLookup({ word }: { word: string }) {
  const [loaded, setLoaded] = useState(false)
  const [blocked, setBlocked] = useState(false)
  // Use direct URL so iframe origin is hanzii.net — avoids CORS on JS/font assets
  const src = `https://hanzii.net/search/word/${encodeURIComponent(word)}?hl=vi`

  useEffect(() => {
    setLoaded(false)
    setBlocked(false)
  }, [word])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 flex-shrink-0">
        <span className="text-slate-800 font-bold text-base truncate">{word}</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-blue-400 text-xs flex-shrink-0 ml-2"
          title="Open in new tab"
        >
          ↗
        </a>
      </div>
      <div className="flex-1 relative">
        {!loaded && !blocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <span className="text-slate-400 text-sm">Loading...</span>
          </div>
        )}
        {blocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white p-4">
            <span className="text-slate-500 text-sm text-center">Hanzii không cho phép nhúng iframe</span>
            <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm underline">
              Mở Hanzii ↗
            </a>
          </div>
        )}
        <iframe
          key={word}
          src={src}
          title={`Hanzii: ${word}`}
          className="w-full h-full border-0"
          style={{ display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => setBlocked(true)}
        />
      </div>
    </div>
  )
}

function PanelHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-shrink-0">
      <span className="text-xl">{icon}</span>
      <span className="text-slate-700 font-semibold text-sm">{label}</span>
    </div>
  )
}
