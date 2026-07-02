export type Card = {
  id: string
  word: string
  topic: string
  type: "theme" | "word"
  faceUp: boolean
}

export type TopicData = {
  name: string
  words: string[]
}

export type VocabFile = {
  topics: TopicData[]
}

export type GameState = {
  stock: Card[]
  waste: Card[]
  foundations: Card[][]        // 4 generic slots. slot[0]=theme, slot[last]=most recent word
  tableau: Card[][]
  topics: string[]
  completedTopics: string[]
  topicCardCounts: Record<string, number>  // total cards per topic (theme + words)
  movesLeft: number
  movesLimit: number
  status: "idle" | "playing" | "won" | "lost"
  selectedCard: Card | null
}
