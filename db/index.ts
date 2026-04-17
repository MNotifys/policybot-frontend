import Dexie, { type Table } from 'dexie'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Conversation {
  id?: number
  title: string
  createdAt: number
  updatedAt: number
  sessionId?: string 
}

export interface Message {
  id?: number
  conversationId: number
  role: 'user' | 'assistant'
  content: string
  createdAt: number
  isStreaming?: boolean
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export class GepbotDB extends Dexie {
  conversations!: Table<Conversation, number>
  messages!: Table<Message, number>

  constructor() {
    super('gepbot')

    this.version(1).stores({
      conversations: '++id, createdAt, updatedAt',
      messages: '++id, conversationId, createdAt',
    })

    this.version(2).stores({
      conversations: '++id, createdAt, updatedAt, sessionId',
      messages: '++id, conversationId, createdAt',
    })
  }
}

export const db = new GepbotDB()
