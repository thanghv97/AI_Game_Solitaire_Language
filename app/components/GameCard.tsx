"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card } from "../types"
import FitText from "./FitText"

type Props = {
  card: Card
  dragId: string
  dragData: object
  onClick?: () => void
  style?: React.CSSProperties
  className?: string
  isTop?: boolean
  stackedCount?: number   // words stacked on this theme card in its column
  totalWords?: number     // total word cards for this topic
}

const CARD_STYLE: React.CSSProperties = {
  width: "var(--card-w)",
  height: "var(--card-h)",
  borderRadius: "var(--card-radius)",
  fontSize: "var(--card-font)",
  flexShrink: 0,
}

export default function GameCard({
  card, dragId, dragData, onClick, style, className = "",
  isTop = false, stackedCount, totalWords,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: dragData,
    disabled: !card.faceUp,
  })

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  if (!card.faceUp) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...CARD_STYLE, ...style, ...dragStyle }}
        className={`border-2 border-slate-600 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center cursor-default select-none ${className}`}
      >
        <div className="w-3/5 h-3/5 rounded border border-slate-500 opacity-30" />
      </div>
    )
  }

  const isTheme = card.type === "theme"
  const showCounter = isTheme && totalWords !== undefined && stackedCount !== undefined

  return (
    <div
      ref={setNodeRef}
      style={{
        ...CARD_STYLE,
        ...style,
        ...dragStyle,
        zIndex: isDragging ? 1000 : undefined,
        borderColor: isTheme ? "#facc15" : "#64748b",
      }}
      {...(isTop ? { ...listeners, ...attributes } : {})}
      onClick={onClick}
      className={`
        border-2 select-none cursor-pointer relative
        flex flex-col items-center justify-center gap-1 p-1
        transition-transform hover:scale-105 active:scale-95
        ${isTheme ? "bg-gradient-to-br from-yellow-900 to-yellow-800 shadow-yellow-500/30 shadow-md" : "bg-gradient-to-br from-slate-800 to-slate-900"}
        ${isDragging ? "opacity-50" : ""}
        ${className}
      `}
    >
      {isTheme ? (
        <>
          {showCounter && (
            <div
              className="absolute top-1 right-1 text-yellow-300 font-bold leading-none tabular-nums"
              style={{ fontSize: "0.6em" }}
            >
              {stackedCount}/{totalWords}
            </div>
          )}
          <span className="font-bold tracking-widest text-yellow-300 leading-none" style={{ fontSize: "0.65em" }}>TOPIC</span>
          <FitText text={card.word} className="font-bold text-yellow-100" style={{ fontSize: "1em" }} />
        </>
      ) : (
        <FitText text={card.word} className="font-semibold text-white" />
      )}
    </div>
  )
}

const TOPIC_COLORS = [
  "#60a5fa", "#34d399", "#f87171", "#a78bfa",
  "#fb923c", "#38bdf8", "#4ade80", "#f472b6",
]
const topicColorMap: Record<string, string> = {}
let colorIdx = 0

export function getTopicColorHex(topic: string): string {
  if (!topicColorMap[topic]) {
    topicColorMap[topic] = TOPIC_COLORS[colorIdx % TOPIC_COLORS.length]
    colorIdx++
  }
  return topicColorMap[topic]
}
