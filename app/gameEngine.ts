import { Card, GameState, TopicData } from "./types"

const NUM_FOUNDATIONS = 4

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function initGame(allTopics: TopicData[]): GameState {
  const minTopics = parseInt(process.env.NEXT_PUBLIC_MIN_TOPICS ?? "2")
  const maxTopics = parseInt(process.env.NEXT_PUBLIC_MAX_TOPICS ?? "4")
  const minWords = parseInt(process.env.NEXT_PUBLIC_MIN_WORDS_PER_TOPIC ?? "3")
  const maxWords = parseInt(process.env.NEXT_PUBLIC_MAX_WORDS_PER_TOPIC ?? "10")

  const numTopics = Math.min(randInt(minTopics, maxTopics), allTopics.length)
  const selectedTopics = shuffle(allTopics).slice(0, numTopics)
  const topicNames = selectedTopics.map((t) => t.name)
  const topicCardCounts: Record<string, number> = {}

  const columns = randInt(3, 5)
  const allCards: Card[] = []

  for (const topic of selectedTopics) {
    const numWords = Math.min(randInt(minWords, maxWords), topic.words.length)
    const pickedWords = shuffle(topic.words).slice(0, numWords)

    topicCardCounts[topic.name] = numWords + 1  // +1 for theme card

    allCards.push({
      id: `theme-${topic.name}`,
      word: topic.name,
      topic: topic.name,
      type: "theme",
      faceUp: false,
    })
    for (const word of pickedWords) {
      allCards.push({
        id: `word-${topic.name}-${word}`,
        word,
        topic: topic.name,
        type: "word",
        faceUp: false,
      })
    }
  }

  const totalCards = allCards.length
  const movesLimit = totalCards * 3
  const shuffled = shuffle(allCards)
  const tableau: Card[][] = Array.from({ length: columns }, () => [])

  const cardsForTableau = Math.min(shuffled.length, columns * 4)
  const perCol = Math.floor(cardsForTableau / columns)
  let cardIdx = 0

  for (let col = 0; col < columns; col++) {
    const count = perCol + (col < cardsForTableau % columns ? 1 : 0)
    for (let i = 0; i < count && cardIdx < shuffled.length; i++) {
      tableau[col].push({ ...shuffled[cardIdx++], faceUp: false })
    }
    if (tableau[col].length > 0) {
      tableau[col][tableau[col].length - 1] = {
        ...tableau[col][tableau[col].length - 1],
        faceUp: true,
      }
    }
  }

  const stock = shuffled.slice(cardIdx).map((c) => ({ ...c, faceUp: false }))

  return {
    stock,
    waste: [],
    foundations: Array.from({ length: NUM_FOUNDATIONS }, () => []),
    tableau,
    topics: topicNames,
    completedTopics: [],
    topicCardCounts,
    movesLeft: movesLimit,
    movesLimit,
    status: "playing",
    selectedCard: null,
  }
}

// ---------- Validation helpers ----------

export function canDropOnTableau(dragged: Card, target: Card | null): boolean {
  if (target === null) return true
  if (dragged.topic !== target.topic) return false
  if (target.type === "theme") return false
  return true
}

export function isStackMovable(col: Card[], fromIndex: number): boolean {
  const stack = col.slice(fromIndex)
  if (stack.some((c) => !c.faceUp)) return false
  const topic = stack[0].topic
  return stack.every((c) => c.topic === topic)
}

// Given any card in a column, resolve to the START of the full valid movable stack.
// The valid stack = contiguous face-up, same-topic run ending at col[col.length-1].
// No matter which card in the run the user grabs, we always move the whole run.
export function resolveFromIdx(col: Card[], draggedIdx: number): number {
  const top = col[col.length - 1]
  if (!top?.faceUp) return draggedIdx

  // Walk back from the top card to find the full same-topic face-up run
  let j = col.length - 1
  while (j > 0 && col[j - 1].faceUp && col[j - 1].topic === top.topic) {
    j--
  }

  // If the dragged card falls inside that run, use the run start
  return draggedIdx >= j ? j : draggedIdx
}

// Can a card drop onto a specific foundation slot?
// - Empty slot → only theme card accepted
// - Slot with theme → word card of same topic accepted (one at a time)
export function canCardDropOnSlot(card: Card, slot: Card[]): boolean {
  if (slot.length === 0) return card.type === "theme"
  const slotTopic = slot[0].topic
  return card.type === "word" && card.topic === slotTopic
}

// Can a whole stack (face-up, same-topic, theme on top) drop onto an empty slot?
export function canStackDropOnSlot(stack: Card[], slot: Card[]): boolean {
  if (slot.length > 0) return false
  if (stack.length === 0) return false
  const topCard = stack[stack.length - 1]
  if (topCard.type !== "theme") return false
  const topic = topCard.topic
  return stack.every((c) => c.topic === topic)
}

// ---------- Completion check ----------

function isSlotComplete(slot: Card[], topicCardCounts: Record<string, number>): boolean {
  if (slot.length === 0) return false
  const topic = slot[0].topic
  return slot.length === topicCardCounts[topic]
}

function checkWin(state: GameState): boolean {
  return state.completedTopics.length === state.topics.length
}

function decrementMoves(state: GameState): GameState {
  const movesLeft = state.movesLeft - 1
  const status = movesLeft <= 0 && state.status !== "won" ? "lost" : state.status
  return { ...state, movesLeft, status }
}

// ---------- After adding to slot: clear if complete ----------

function applyFoundationDrop(
  state: GameState,
  slotIndex: number,
  cardsToAdd: Card[]  // in order: [theme, word, word...] for full stack, or [word] for single
): GameState {
  const slot = state.foundations[slotIndex]
  const newSlot = [...slot, ...cardsToAdd]
  let foundations = state.foundations.map((s, i) => (i === slotIndex ? newSlot : s))
  let completedTopics = state.completedTopics

  if (isSlotComplete(newSlot, state.topicCardCounts)) {
    completedTopics = [...state.completedTopics, newSlot[0].topic]
    foundations = foundations.map((s, i) => (i === slotIndex ? [] : s))
  }

  const next = { ...state, foundations, completedTopics }
  const won = checkWin(next)
  return { ...next, status: won ? "won" : next.status }
}

// ---------- Move functions ----------

export function drawFromStock(state: GameState): GameState {
  if (state.stock.length > 0) {
    // Normal draw
    const [top, ...rest] = state.stock
    return decrementMoves({
      ...state,
      stock: rest,
      waste: [...state.waste, { ...top, faceUp: true }],
    })
  }
  // Stock empty → recycle waste back to stock (unlimited)
  if (state.waste.length > 0) {
    const recycled = [...state.waste].reverse().map((c) => ({ ...c, faceUp: false }))
    return decrementMoves({
      ...state,
      stock: recycled,
      waste: [],
    })
  }
  return state
}

export function moveTableauToTableau(
  state: GameState,
  fromCol: number,
  fromIdx: number,
  toCol: number
): GameState | null {
  if (fromCol === toCol) return null  // drop on same column = no-op
  const fromColumn = state.tableau[fromCol]
  const toColumn = state.tableau[toCol]
  const actualFrom = resolveFromIdx(fromColumn, fromIdx)
  const stack = fromColumn.slice(actualFrom)

  if (!isStackMovable(fromColumn, actualFrom)) return null

  const targetCard = toColumn.length > 0 ? toColumn[toColumn.length - 1] : null
  if (!canDropOnTableau(stack[0], targetCard)) return null

  const newFrom = fromColumn.slice(0, actualFrom)
  if (newFrom.length > 0 && !newFrom[newFrom.length - 1].faceUp) {
    newFrom[newFrom.length - 1] = { ...newFrom[newFrom.length - 1], faceUp: true }
  }

  const newTableau = state.tableau.map((col, i) => {
    if (i === fromCol) return newFrom
    if (i === toCol) return [...toColumn, ...stack]
    return col
  })

  return decrementMoves({ ...state, tableau: newTableau })
}

export function moveWasteToTableau(state: GameState, toCol: number): GameState | null {
  if (state.waste.length === 0) return null
  const card = state.waste[state.waste.length - 1]
  const toColumn = state.tableau[toCol]
  const targetCard = toColumn.length > 0 ? toColumn[toColumn.length - 1] : null

  if (!canDropOnTableau(card, targetCard)) return null

  const newTableau = state.tableau.map((col, i) =>
    i === toCol ? [...toColumn, card] : col
  )
  return decrementMoves({ ...state, waste: state.waste.slice(0, -1), tableau: newTableau })
}

// Move from tableau to a foundation slot (single card OR full same-topic stack)
export function moveTableauToFoundation(
  state: GameState,
  fromCol: number,
  fromIdx: number,
  slotIndex: number
): GameState | null {
  const fromColumn = state.tableau[fromCol]
  const slot = state.foundations[slotIndex]
  const actualFrom = resolveFromIdx(fromColumn, fromIdx)
  const stack = fromColumn.slice(actualFrom)

  if (stack.some((c) => !c.faceUp)) return null

  let cardsToAdd: Card[]

  if (slot.length === 0) {
    // Empty slot: accept theme-topped same-topic stack (or just a theme card)
    if (!canStackDropOnSlot(stack, slot)) return null
    // Reverse so theme is first (slot[0] = theme, subsequent = words)
    cardsToAdd = [...stack].reverse()
  } else {
    // Non-empty slot: accept one or more word cards of matching topic
    const slotTopic = slot[0].topic
    if (stack.some((c) => c.type !== "word" || c.topic !== slotTopic)) return null
    cardsToAdd = stack  // add all in array order (bottom-to-top)
  }

  // Remove dragged cards from column, auto-flip newly exposed card
  const remainingCol = fromColumn.slice(0, actualFrom)
  if (remainingCol.length > 0 && !remainingCol[remainingCol.length - 1].faceUp) {
    remainingCol[remainingCol.length - 1] = { ...remainingCol[remainingCol.length - 1], faceUp: true }
  }

  const newTableau = state.tableau.map((col, i) => (i === fromCol ? remainingCol : col))
  const afterDrop = applyFoundationDrop({ ...state, tableau: newTableau }, slotIndex, cardsToAdd)
  return decrementMoves(afterDrop)
}

// Move waste top card to a foundation slot
export function moveWasteToFoundation(state: GameState, slotIndex: number): GameState | null {
  if (state.waste.length === 0) return null
  const card = state.waste[state.waste.length - 1]
  const slot = state.foundations[slotIndex]

  if (!canCardDropOnSlot(card, slot)) return null

  // For a theme card going to empty slot: cardsToAdd = [theme]
  // For a word card going to non-empty slot: cardsToAdd = [word]
  const afterDrop = applyFoundationDrop(
    { ...state, waste: state.waste.slice(0, -1) },
    slotIndex,
    [card]
  )
  return decrementMoves(afterDrop)
}
