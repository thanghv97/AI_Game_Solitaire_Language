"use client"

import { useDroppable } from "@dnd-kit/core"
import { Card } from "../types"
import { getTopicColorHex } from "./GameCard"
import FitText from "./FitText"

type Props = {
  slotIndex: number
  cards: Card[]
  topicCardCounts: Record<string, number>
  onCardClick: (card: Card) => void
}

const SLOT_STYLE: React.CSSProperties = {
  width: "var(--card-w)",
  height: "var(--card-h)",
  borderRadius: "var(--card-radius)",
  fontSize: "var(--card-font)",
  flexShrink: 0,
}

export default function Foundation({ slotIndex, cards, topicCardCounts, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `foundation-${slotIndex}`,
    data: { zone: "foundation", slotIndex },
  })

  const themeCard = cards[0]
  const topCard = cards[cards.length - 1]
  const topic = themeCard?.topic ?? null
  const color = topic ? getTopicColorHex(topic) : null
  const hasCards = cards.length > 0

  const wordsInSlot = hasCards ? cards.length - 1 : 0
  const totalWords = topic ? (topicCardCounts[topic] ?? 1) - 1 : 0

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-5 flex items-center">
        {topic ? (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ backgroundColor: color + "33", color: color ?? undefined }}
          >
            {topic}
          </span>
        ) : (
          <span className="text-xs text-slate-700">—</span>
        )}
      </div>

      <div
        ref={setNodeRef}
        style={SLOT_STYLE}
        className={`
          border-2 flex flex-col items-center justify-center transition-all select-none relative cursor-pointer
          ${isOver
            ? "border-yellow-400 bg-yellow-950/40 scale-105 shadow-yellow-500/30 shadow-lg"
            : hasCards
              ? "border-yellow-600/60 bg-slate-800/50"
              : "border-slate-600 border-dashed bg-slate-900/20 hover:border-slate-500"
          }
        `}
        onClick={() => topCard && onCardClick(topCard)}
      >
        {hasCards ? (
          <>
            {/* X/Y counter — always visible once topic is established */}
            <div
              className="absolute top-1 right-1 text-yellow-300 font-bold leading-none tabular-nums"
              style={{ fontSize: "0.6em" }}
            >
              {wordsInSlot}/{totalWords}
            </div>
            {topCard.type === "theme" ? (
              <div className="flex flex-col items-center gap-0.5 p-1">
                <span className="font-bold tracking-widest text-yellow-300" style={{ fontSize: "0.65em" }}>TOPIC</span>
                <FitText text={topCard.word} className="font-bold text-yellow-100" />
              </div>
            ) : (
              <FitText text={topCard.word} className="font-semibold text-white leading-tight" />
            )}
          </>
        ) : (
          <>
            <span className="text-slate-600 text-2xl">♠</span>
            <span className="text-slate-700 mt-1" style={{ fontSize: "0.7em" }}>F{slotIndex + 1}</span>
          </>
        )}
      </div>
    </div>
  )
}
