"use client"

import { useDroppable } from "@dnd-kit/core"
import { Card } from "../types"
import GameCard from "./GameCard"

type Props = {
  colIndex: number
  cards: Card[]
  topicCardCounts: Record<string, number>
  onCardClick: (card: Card) => void
}

export default function TableauColumn({ colIndex, cards, topicCardCounts, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tableau-${colIndex}`,
    data: { zone: "tableau", colIndex },
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex-1 rounded-xl border-2 transition-colors overflow-visible
        ${isOver ? "border-blue-400 bg-blue-950/30" : "border-slate-700 bg-slate-900/30"}
      `}
      style={{
        minWidth: "calc(var(--card-w) + 8px)",
        minHeight: cards.length === 0
          ? "calc(var(--card-h) + 16px)"
          : `calc(var(--card-h) + (${cards.length - 1}) * var(--card-overlap) + 16px)`,
      }}
    >
      {cards.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-slate-600 text-xs">empty</span>
        </div>
      ) : (
        cards.map((card, cardIdx) => {
          let stackedCount: number | undefined
          let totalWords: number | undefined
          if (card.type === "theme" && card.faceUp) {
            // count word cards of the same topic that appear above this card in the column
            stackedCount = cards.slice(cardIdx + 1).filter(
              c => c.topic === card.topic && c.type === "word"
            ).length
            totalWords = (topicCardCounts[card.topic] ?? 1) - 1
          }

          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                top: `calc(${cardIdx} * var(--card-overlap))`,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: cardIdx,
              }}
            >
              <GameCard
                card={card}
                dragId={`tableau-${colIndex}-${cardIdx}`}
                dragData={{ card, source: { zone: "tableau", colIndex, cardIndex: cardIdx } }}
                onClick={() => card.faceUp && onCardClick(card)}
                isTop={card.faceUp}
                stackedCount={stackedCount}
                totalWords={totalWords}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
