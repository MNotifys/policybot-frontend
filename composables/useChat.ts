import { ref } from 'vue'
import { db } from '../db'
import { useChatStore } from '../stores/chat'
import { useRuntimeConfig } from 'nuxt/app'

export function useChat() {
  const store = useChatStore()
  const config = useRuntimeConfig()
  const API_BASE = config.public.apiBase as string

  const controller = ref<AbortController | null>(null)

  async function ensureConversation(): Promise<number> {
    if (store.activeConversationId) return store.activeConversationId
    return newConversation()
  }


  async function newConversation(): Promise<number> {
    const now = Date.now()
    const id = (await db.conversations.add({
      title: 'New Chat',
      createdAt: now,
      updatedAt: now,
    })) as number
    store.activeConversationId = id
    return id
  }

  function stopStreaming() {
    controller.value?.abort()
  }

  async function sendMessage(content: string): Promise<void> {
    const trimmed = content.trim()
    if (!trimmed || store.isStreaming) return

    const conversationId = await ensureConversation()
    const now = Date.now()

    const existingCount = await db.messages
      .where('conversationId')
      .equals(conversationId)
      .count()

    await db.messages.add({
      conversationId,
      role: 'user',
      content: trimmed,
      createdAt: now,
      isStreaming: false,
    })

    if (existingCount === 0) {
      const title = trimmed.length > 60 ? trimmed.slice(0, 60) + '…' : trimmed
      await db.conversations.update(conversationId, { title, updatedAt: now })
    } else {
      await db.conversations.update(conversationId, { updatedAt: now })
    }

    const assistantMsgId = (await db.messages.add({
      conversationId,
      role: 'assistant',
      content: '',
      createdAt: now + 1,
      isStreaming: true,
    })) as number

    store.isStreaming = true
    let accumulated = ''
    const abort = new AbortController()
    controller.value = abort

    const conversation = await db.conversations.get(conversationId)
    const sessionId = conversation?.sessionId ?? store.activeSessionId ?? null

    try {
      const res = await fetch(`${API_BASE}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          ...(sessionId ? { session_id: sessionId } : {}),
        }),
        signal: abort.signal,
      })

      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`)
      if (!res.body) throw new Error('Response body is empty')

      const data = await res.json()
      if (data.session_id && data.session_id !== sessionId) {
        store.activeSessionId = data.session_id
        await db.conversations.update(conversationId, { sessionId: data.session_id })
      }

      accumulated = data.content ?? ''
      const suggestions = data.metadata?.follow_up_questions ?? data.follow_up_questions ?? []
      const sources = data.metadata?.sources ?? data.sources ?? []
      await db.messages.update(assistantMsgId, { content: accumulated })

    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError'

      if (!isAbort) {
        console.error('[useChat] Error:', err)
        const errorContent = accumulated
          ? accumulated + '\n\n_⚠ Stream ended unexpectedly._'
          : '_⚠ Could not reach the server. Is the backend running?_'
        await db.messages.update(assistantMsgId, { content: errorContent })
      }
    } finally {
      await db.messages.update(assistantMsgId, { isStreaming: false })
      store.isStreaming = false
      controller.value = null
    }
  }

  return { sendMessage, newConversation, stopStreaming }
}
