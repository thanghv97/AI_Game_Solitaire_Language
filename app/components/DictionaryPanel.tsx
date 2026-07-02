"use client"

import { Card } from "../types"
import { getTopicColorHex } from "./GameCard"

type Props = {
  card: Card | null
}

const PLACEHOLDER_DEFS: Record<string, { ipa: string; pos: string; def: string; example: string }> = {
  shelf: { ipa: "/ʃelf/", pos: "noun", def: "A flat board fixed to a wall or in a frame, used to hold objects.", example: "She put the book on the shelf." },
  bookmark: { ipa: "/ˈbʊk.mɑːk/", pos: "noun", def: "A strip of leather, cardboard, or other material placed between pages of a book.", example: "He left a bookmark to mark his place." },
  ladle: { ipa: "/ˈleɪ.dəl/", pos: "noun", def: "A large, deep spoon with a long handle, used for serving soup.", example: "She used a ladle to serve the soup." },
  whisk: { ipa: "/wɪsk/", pos: "noun/verb", def: "A utensil for whisking eggs or cream, or the action of mixing quickly.", example: "Whisk the eggs until fluffy." },
}

export default function DictionaryPanel({ card }: Props) {
  if (!card) {
    return (
      <div className="h-full flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
          <span className="text-xl">📖</span>
          <span className="text-slate-300 font-semibold text-sm">Dictionary</span>
        </div>
        <div className="flex-1 flex flex-col gap-3 text-slate-500 text-xs">
          <p className="font-semibold text-slate-400">How to play:</p>
          <ul className="space-y-2 leading-relaxed">
            <li>• Upload a vocab JSON file to start</li>
            <li>• Drag cards to stack same-topic words</li>
            <li>• Theme card (gold border) must be on top of a stack to send to Foundation</li>
            <li>• Move full stacks to Foundation to win</li>
            <li>• Click any face-up card to see its definition</li>
            <li>• Draw from Stock (left pile) one card at a time</li>
          </ul>
          <div className="mt-2 p-2 rounded bg-slate-800/50 text-slate-400">
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

  if (card.type === "theme") {
    return (
      <div className="h-full flex flex-col gap-4 p-4">
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
          <span className="text-xl">🏷️</span>
          <span className="text-slate-300 font-semibold text-sm">Topic Card</span>
        </div>
        <div className="flex flex-col gap-3">
          <div
            className="px-3 py-2 rounded-lg border border-yellow-500/40 bg-yellow-900/20"
          >
            <p className="text-yellow-300 text-xl font-bold">{card.word}</p>
            <p className="text-yellow-500 text-xs mt-1">Theme / Topic card</p>
          </div>
          <p className="text-slate-400 text-xs">
            This is a topic card. Place all words of the same topic under this card,
            then drag the whole stack to the Foundation to complete the topic.
          </p>
        </div>
      </div>
    )
  }

  const def = PLACEHOLDER_DEFS[card.word.toLowerCase()]
  const color = getTopicColorHex(card.topic)

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 border-b border-slate-700 pb-3">
        <span className="text-xl">📖</span>
        <span className="text-slate-300 font-semibold text-sm">Dictionary</span>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-white text-2xl font-bold">{card.word}</p>
          {def ? (
            <p className="text-slate-400 text-sm mt-0.5">{def.ipa}</p>
          ) : (
            <p className="text-slate-500 text-sm mt-0.5">/ˈpləˌsˌhōldər/</p>
          )}
        </div>

        <span
          className="inline-block px-2 py-0.5 rounded text-xs font-medium w-fit"
          style={{ backgroundColor: color + "22", color }}
        >
          {card.topic}
        </span>

        {def ? (
          <>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{def.pos}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{def.def}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">Example:</p>
              <p className="text-slate-300 text-sm italic">&ldquo;{def.example}&rdquo;</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">noun</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Definition will appear here when connected to a dictionary API.
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-slate-500 text-xs mb-1">Example:</p>
              <p className="text-slate-500 text-sm italic">
                &ldquo;Example sentence will be shown here...&rdquo;
              </p>
            </div>
            <p className="text-slate-600 text-xs">
              🔌 Connect a dictionary API to see real definitions
            </p>
          </>
        )}
      </div>
    </div>
  )
}
