"use client"

import { useCallback, useReducer, useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import { Card, GameState, VocabFile } from "../types"
import {
  initGame,
  drawFromStock,
  moveTableauToTableau,
  moveWasteToTableau,
  moveTableauToFoundation,
  moveWasteToFoundation,
} from "../gameEngine"
import TableauColumn from "./TableauColumn"
import Foundation from "./Foundation"
import StockWaste from "./StockWaste"
import DictionaryPanel from "./DictionaryPanel"
import { getTopicColorHex } from "./GameCard"

type Props = {
  vocabFile: VocabFile
  onRestart: () => void
}

type Action =
  | { type: "DRAW" }
  | { type: "MOVE_T2T"; fromCol: number; fromIdx: number; toCol: number }
  | { type: "MOVE_W2T"; toCol: number }
  | { type: "MOVE_T2F"; fromCol: number; fromIdx: number; slotIndex: number }
  | { type: "MOVE_W2F"; slotIndex: number }
  | { type: "SELECT_CARD"; card: Card | null }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "DRAW":
      return drawFromStock(state)
    case "MOVE_T2T": {
      return moveTableauToTableau(state, action.fromCol, action.fromIdx, action.toCol) ?? state
    }
    case "MOVE_W2T": {
      return moveWasteToTableau(state, action.toCol) ?? state
    }
    case "MOVE_T2F": {
      return moveTableauToFoundation(state, action.fromCol, action.fromIdx, action.slotIndex) ?? state
    }
    case "MOVE_W2F": {
      return moveWasteToFoundation(state, action.slotIndex) ?? state
    }
    case "SELECT_CARD":
      return { ...state, selectedCard: action.card }
    default:
      return state
  }
}

export default function GameBoard({ vocabFile, onRestart }: Props) {
  const [gameState, dispatch] = useReducer(reducer, undefined, () =>
    initGame(vocabFile.topics)
  )
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveCard(null)
    const { active, over } = event
    if (!over) return

    const src = active.data.current as {
      card: Card
      source:
        | { zone: "tableau"; colIndex: number; cardIndex: number }
        | { zone: "waste" }
    }
    const dst = over.data.current as
      | { zone: "tableau"; colIndex: number }
      | { zone: "foundation"; slotIndex: number }

    if (!src || !dst) return

    if (dst.zone === "tableau") {
      if (src.source.zone === "tableau") {
        dispatch({
          type: "MOVE_T2T",
          fromCol: src.source.colIndex,
          fromIdx: src.source.cardIndex,
          toCol: dst.colIndex,
        })
      } else if (src.source.zone === "waste") {
        dispatch({ type: "MOVE_W2T", toCol: dst.colIndex })
      }
    } else if (dst.zone === "foundation") {
      if (src.source.zone === "tableau") {
        dispatch({
          type: "MOVE_T2F",
          fromCol: src.source.colIndex,
          fromIdx: src.source.cardIndex,
          slotIndex: dst.slotIndex,
        })
      } else if (src.source.zone === "waste") {
        dispatch({ type: "MOVE_W2F", slotIndex: dst.slotIndex })
      }
    }
  }, [])

  const handleCardClick = useCallback((card: Card) => {
    dispatch({ type: "SELECT_CARD", card })
  }, [])

  const pct = Math.round((gameState.movesLeft / gameState.movesLimit) * 100)
  const barColor = pct > 50 ? "bg-green-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500"
  const completed = gameState.completedTopics.length
  const total = gameState.topics.length

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e) => {
        const data = e.active.data.current as { card: Card }
        setActiveCard(data?.card ?? null)
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-shrink-0">
          <h1 className="text-lg font-bold">
            Vocab <span className="text-yellow-400">Solitaire</span>
          </h1>
          <div className="flex items-center gap-5 flex-wrap justify-end">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-sm">Topics:</span>
              <span className="font-bold text-white">{completed}/{total}</span>
              {gameState.completedTopics.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: getTopicColorHex(t) + "33", color: getTopicColorHex(t) }}
                >
                  ✓ {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Moves:</span>
              <span
                className={`text-lg font-bold tabular-nums ${
                  gameState.movesLeft <= gameState.movesLimit * 0.1
                    ? "text-red-400 animate-pulse"
                    : gameState.movesLeft <= gameState.movesLimit * 0.25
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {gameState.movesLeft}
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              onClick={onRestart}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
            >
              New Game
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Game Area */}
          <div className="flex-1 flex flex-col gap-4 p-4 min-w-0 overflow-auto">
            {/* Stock + Waste + Foundations */}
            <div className="flex items-end gap-6 flex-wrap">
              <StockWaste
                stock={gameState.stock}
                waste={gameState.waste}
                onDraw={() => dispatch({ type: "DRAW" })}
                onCardClick={handleCardClick}
              />
              {/* 4 fixed foundation slots */}
              <div className="flex gap-3 items-end">
                {gameState.foundations.map((slot, i) => (
                  <Foundation
                    key={i}
                    slotIndex={i}
                    cards={slot}
                    topicCardCounts={gameState.topicCardCounts}
                    onCardClick={handleCardClick}
                  />
                ))}
              </div>
            </div>

            {/* Tableau */}
            <div className="flex gap-2 flex-1 items-start pt-2 flex-wrap">
              {gameState.tableau.map((col, i) => (
                <TableauColumn
                  key={i}
                  colIndex={i}
                  cards={col}
                  topicCardCounts={gameState.topicCardCounts}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          </div>

          {/* Dictionary Panel */}
          <div className="w-[22%] min-w-[160px] max-w-xs border-l border-slate-800 bg-slate-900 overflow-y-auto flex-shrink-0">
            <DictionaryPanel card={gameState.selectedCard} />
          </div>
        </div>

        {/* Win/Lose overlay */}
        {(gameState.status === "won" || gameState.status === "lost") && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 text-center max-w-sm mx-4">
              <div className="text-5xl mb-4">
                {gameState.status === "won" ? "🎉" : "😢"}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {gameState.status === "won" ? "You Won!" : "Game Over"}
              </h2>
              <p className="text-slate-400 mb-6 text-sm">
                {gameState.status === "won"
                  ? "All topics cleared!"
                  : `${completed}/${total} topics cleared.`}
              </p>
              <button
                onClick={onRestart}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <DragOverlay>
        {activeCard && (
          <div
            style={{
              width: "var(--card-w)",
              height: "var(--card-h)",
              borderRadius: "var(--card-radius)",
              fontSize: "var(--card-font)",
            }}
            className={`
              border-2 flex flex-col items-center justify-center p-1 gap-1
              opacity-90 rotate-2 shadow-2xl
              ${activeCard.type === "theme"
                ? "border-yellow-400 bg-gradient-to-br from-yellow-900 to-yellow-800"
                : "border-slate-500 bg-gradient-to-br from-slate-800 to-slate-900"
              }
            `}
          >
            {activeCard.type === "theme" ? (
              <>
                <span className="font-bold tracking-widest text-yellow-300 leading-none" style={{ fontSize: "0.65em" }}>TOPIC</span>
                <span className="font-bold text-center leading-tight text-yellow-100 px-0.5 break-all">{activeCard.word}</span>
              </>
            ) : (
              <span className="font-semibold text-center leading-tight text-white px-0.5 break-all">
                {activeCard.word}
              </span>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
