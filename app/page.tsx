"use client"

import { useEffect, useState } from "react"
import GameBoard from "./components/GameBoard"
import DictionarySelector from "./components/DictionarySelector"
import { VocabFile } from "./types"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [vocab, setVocab] = useState<VocabFile | null>(null)
  const [lang, setLang] = useState<string>("en")
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  if (!vocab) {
    return (
      <DictionarySelector
        onPlay={(v, l) => {
          setVocab(v)
          setLang(l)
          setGameKey((k) => k + 1)
        }}
      />
    )
  }

  return (
    <GameBoard
      key={gameKey}
      vocabFile={vocab}
      lang={lang}
      onRestart={() => setVocab(null)}
    />
  )
}
