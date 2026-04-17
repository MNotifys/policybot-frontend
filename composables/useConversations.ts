import { ref, watchEffect, type Ref } from 'vue'
import { liveQuery } from 'dexie'
import { from } from 'rxjs'
import { onUnmounted } from 'vue'
import { db, type Conversation, type Message } from '../db'


export function useConversations() {
  const conversations = ref<Conversation[]>([])

  if (import.meta.client) {
    const sub = from(
      liveQuery(() =>
        db.conversations.orderBy('updatedAt').reverse().toArray()
      )
    ).subscribe({
      next: (result) => {
        conversations.value = result
      },
      error: (err) => console.error('[useConversations] liveQuery error:', err),
    })

    onUnmounted(() => sub.unsubscribe())
  }

  async function createConversation(title = 'New Chat'): Promise<number> {
    const now = Date.now()
    return db.conversations.add({ title, createdAt: now, updatedAt: now }) as Promise<number>
  }

  async function deleteConversation(id: number): Promise<void> {
    await db.messages.where('conversationId').equals(id).delete()
    await db.conversations.delete(id)
  }

  async function updateTitle(id: number, title: string): Promise<void> {
    await db.conversations.update(id, { title, updatedAt: Date.now() })
  }

  return { conversations, createConversation, deleteConversation, updateTitle }
}

export function useMessages(conversationId: Ref<number | null>) {
  const messages = ref<Message[]>([])

  if (import.meta.client) {
    watchEffect((onCleanup) => {
      const id = conversationId.value

      if (!id) {
        messages.value = []
        return
      }

      const sub = from(
        liveQuery(() =>
          db.messages
            .where('conversationId')
            .equals(id)
            .sortBy('createdAt')
        )
      ).subscribe({
        next: (result) => {
          messages.value = result
        },
        error: (err) => console.error('[useMessages] liveQuery error:', err),
      })
      onCleanup(() => sub.unsubscribe())
    })
  }

  return { messages }
}
