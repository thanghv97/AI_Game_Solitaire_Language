"use client"

import { useRef, useState } from "react"
import { VocabFile } from "../types"

type Props = {
  onLoad: (data: VocabFile) => void
}

export default function UploadScreen({ onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  function handleFile(file: File) {
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string) as VocabFile
        if (!json.topics || !Array.isArray(json.topics)) {
          setError('Invalid format: expected { "topics": [...] }')
          return
        }
        onLoad(json)
      } catch {
        setError("Failed to parse JSON file.")
      }
    }
    reader.readAsText(file)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function loadSample() {
    const sample: VocabFile = {
      topics: [
        { name: "LIBRARY", words: ["shelf", "bookmark", "catalogue", "manuscript", "archive", "librarian"] },
        { name: "KITCHEN", words: ["ladle", "colander", "whisk", "spatula", "cleaver", "grater"] },
        { name: "GARDEN", words: ["trowel", "compost", "pruning", "mulch", "seedling", "perennial"] },
        { name: "MUSIC", words: ["tempo", "harmony", "chord", "melody", "rhythm", "cadence"] },
      ],
    }
    onLoad(sample)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Vocab <span className="text-yellow-400">Solitaire</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Learn vocabulary through card game strategy
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${dragging
              ? "border-yellow-400 bg-yellow-950/20"
              : "border-slate-600 hover:border-slate-400 bg-slate-800/30 hover:bg-slate-800/50"
            }
          `}
        >
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-300 font-medium mb-1">Upload vocab JSON</p>
          <p className="text-slate-500 text-sm">Drag & drop or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            onChange={handleInput}
            className="hidden"
          />
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-900/40 border border-red-500/40">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={loadSample}
            className="text-slate-400 hover:text-yellow-400 text-sm underline underline-offset-2 transition-colors"
          >
            Or use sample vocabulary
          </button>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-slate-800/40 border border-slate-700">
          <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">
            JSON Format
          </p>
          <pre className="text-slate-500 text-xs leading-relaxed overflow-auto">{`{
  "topics": [
    {
      "name": "LIBRARY",
      "words": ["shelf", "bookmark", ...]
    }
  ]
}`}</pre>
        </div>
      </div>
    </div>
  )
}
