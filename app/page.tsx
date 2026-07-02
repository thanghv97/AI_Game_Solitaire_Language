"use client"

import { useState, useEffect } from "react"
import GameBoard from "./components/GameBoard"
import { VocabFile } from "./types"
import dictionaryData from "../dictionary.json"

const vocab = dictionaryData as VocabFile

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [gameKey, setGameKey] = useState(0)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  return (
    <GameBoard
      key={gameKey}
      vocabFile={vocab}
      onRestart={() => setGameKey((k) => k + 1)}
    />
  )
}
