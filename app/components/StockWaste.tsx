"use client"

import { useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { Card } from "../types"
import FitText from "./FitText"

type Props = {
  stock: Card[]
  waste: Card[]
  onDraw: () => void
  onCardClick: (card: Card) => void
}

const CARD_STYLE: React.CSSProperties = {
  width: "var(--card-w)",
  height: "var(--card-h)",
  borderRadius: "var(--card-radius)",
  fontSize: "var(--card-font)",
  flexShrink: 0,
}

function WasteCard({ card, onCardClick }: { card: Card; onCardClick: (c: Card) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: "waste-top",
    data: { card, source: { zone: "waste" } },
  })

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const isTheme = card.type === "theme"

  return (
    <div
      ref={setNodeRef}
      style={{ ...CARD_STYLE, ...dragStyle, zIndex: isDragging ? 1000 : undefined, touchAction: "none" }}
      {...listeners}
      {...attributes}
      onDoubleClick={() => onCardClick(card)}
      className={`
        border-2 select-none cursor-grab active:cursor-grabbing
        flex flex-col items-center justify-center p-1 gap-1
        transition-transform hover:scale-105
        ${isTheme
          ? "border-yellow-400 bg-gradient-to-br from-yellow-900 to-yellow-800"
          : "border-slate-500 bg-gradient-to-br from-slate-800 to-slate-900"
        }
        ${isDragging ? "opacity-50" : ""}
      `}
    >
      {isTheme ? (
        <>
          <span className="font-bold tracking-widest text-yellow-300 leading-none" style={{ fontSize: "0.65em" }}>TOPIC</span>
          <FitText text={card.word} className="font-bold text-yellow-100" />
        </>
      ) : (
        <FitText text={card.word} className="font-semibold text-white" />
      )}
    </div>
  )
}

export default function StockWaste({ stock, waste, onDraw, onCardClick }: Props) {
  const { setNodeRef: wasteDropRef, isOver: wasteIsOver } = useDroppable({
    id: "waste-zone",
    data: { zone: "waste" },
  })

  const topWaste = waste[waste.length - 1]
  const stockEmpty = stock.length === 0
  const canRecycle = stockEmpty && waste.length > 0

  return (
    <div className="flex gap-3 items-start">
      {/* Stock */}
      <div className="flex flex-col items-center gap-1">
        <div
          onClick={stockEmpty && waste.length === 0 ? undefined : onDraw}
          style={CARD_STYLE}
          className={`
            border-2 flex items-center justify-center transition-all select-none
            ${stockEmpty && waste.length === 0
              ? "border-slate-800 bg-slate-950/50 cursor-not-allowed opacity-40"
              : canRecycle
                ? "border-blue-500 bg-gradient-to-br from-blue-900/60 to-slate-800 cursor-pointer hover:border-blue-400 hover:scale-105"
                : "border-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 cursor-pointer hover:border-blue-400 hover:scale-105"
            }
          `}
        >
          {canRecycle ? (
            <span className="text-blue-300 leading-none" style={{ fontSize: "2em" }}>↺</span>
          ) : stock.length > 0 ? (
            <div className="flex flex-col items-center gap-1">
              <div
                className="rounded border border-slate-500 opacity-40"
                style={{ width: "55%", height: "55%" }}
              />
              <span className="text-slate-400" style={{ fontSize: "0.75em" }}>{stock.length}</span>
            </div>
          ) : (
            <span className="text-slate-700" style={{ fontSize: "0.75em" }}>—</span>
          )}
        </div>
        <span className="text-slate-600" style={{ fontSize: "var(--card-font)" }}>stock</span>
      </div>

      {/* Waste */}
      <div className="flex flex-col items-center gap-1">
        <div
          ref={wasteDropRef}
          style={CARD_STYLE}
          className={`
            border-2 flex items-center justify-center
            ${wasteIsOver ? "border-blue-400" : "border-slate-700"}
            ${waste.length === 0 ? "bg-slate-900/30" : ""}
          `}
        >
          {topWaste ? (
            <WasteCard card={topWaste} onCardClick={onCardClick} />
          ) : (
            <span className="text-slate-600" style={{ fontSize: "var(--card-font)" }}>waste</span>
          )}
        </div>
        <span className="text-slate-600" style={{ fontSize: "var(--card-font)" }}>waste</span>
      </div>
    </div>
  )
}
