<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '../db'
import { useMarkdown } from '../composables/useMarkdown';

const props = defineProps<{ message: Message }>()
const emit = defineEmits<{ suggest: [s: string] }>()

const { render } = useMarkdown()

const renderedHtml = computed(() => render(props.message.content ?? ''))

const sources = computed(() => (props.message as any).sources ?? [])
const hasSources = computed(() => sources.value.length > 0)

const suggestions = computed(() => (props.message as any).suggestions ?? [])

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const userInitial = letters[Math.floor(Math.random() * letters.length)]

function handleBubbleClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.code-block__copy')
  if (!btn) return
  const encoded = btn.getAttribute('data-code')
  if (!encoded) return
  navigator.clipboard.writeText(decodeURIComponent(encoded)).then(() => {
    const original = btn.textContent
    btn.textContent = 'Copied!'
    btn.classList.add('code-block__copy--done')
    setTimeout(() => {
      btn.textContent = original
      btn.classList.remove('code-block__copy--done')
    }, 2000)
  })
}
</script>

<template>
  <div class="chat-item" :class="message.role === 'user' ? 'chat-item--user' : 'chat-item--assistant'">

    <div v-if="message.role === 'assistant'" class="assistant-avatar" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3c-1 0-1.8.8-1.8 1.8 0 .6.3 1.1.7 1.5C8.1 7.1 6 9.8 6 13c0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.2-2.1-5.9-4.9-6.7.4-.4.7-.9.7-1.5C13.8 3.8 13 3 12 3z"
          fill="var(--accent)" />
        <circle cx="10" cy="13" r="1" fill="white" />
        <circle cx="14" cy="13" r="1" fill="white" />
      </svg>
    </div>

    <div class="msg-body">

      <div v-if="message.role === 'user'" class="user-bubble">
        {{ message.content }}
      </div>

      <div v-else class="assistant-bubble" @click="handleBubbleClick">

        <div v-if="!message.content" class="waiting-indicator">
          <span class="typing-dots">
            <span class="typing-dot" />
            <span class="typing-dot" />
            <span class="typing-dot" />
          </span>
        </div>

        <div v-else class="markdown-content prose" v-html="renderedHtml" />

        <div v-if="hasSources" class="sources-section">
          <div class="sources-header">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12v1.5H2V3zm0 3h9v1.5H2V6zm0 3h12v1.5H2V9zm0 3h6v1.5H2V12z" fill="currentColor" />
            </svg>
            <span>Sources</span>
          </div>
          <div class="sources-list">
            <div v-for="(src, i) in sources" :key="i" class="source-item">
              <span class="source-number">{{ Number(i) + 1 }}</span>
              <span class="source-label">
                {{ typeof src === 'string' ? src : (src.title ?? src.name ?? src.url ?? src) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="message.role === 'assistant' && suggestions.length" class="followups">
        <button v-for="s in suggestions" :key="s" class="followup-chip" @click="emit('suggest', s)">
          {{ s }}
        </button>
      </div>
    </div>

    <div v-if="message.role === 'user'" class="user-avatar" aria-hidden="true">
      {{ userInitial }}
    </div>

  </div>
</template>

<style scoped>
.chat-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-inline: 1rem;
  margin-block-end: 0.5rem;
}

.chat-item--user {
  justify-content: flex-end;
}

.chat-item--assistant {
  justify-content: flex-start;
}

.assistant-avatar {
  flex-shrink: 0;
  width: 1.8rem;
  height: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg, #fff);
}

.assistant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  min-height: 2.5rem;
  border-radius: 50%;
  background: var(--bg-tertiary, #e8e8e8);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  bottom: 0.5rem;
  align-self: flex-end;
  z-index: 1;
}

.msg-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.user-bubble {
  position: relative;
  background-color: var(--accent);
  color: #ffffff;
  border-radius: 12px;
  border-bottom-right-radius: 0.25rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 40ch;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-bubble::after {
  content: "";
  position: absolute;
  bottom: 0px;
  right: -9px;
  width: 18px;
  height: 18px;
  background-color: var(--accent);
  clip-path: polygon(0 0, 0 100%, 100% 0);
  border-bottom-left-radius: 8px;
  border-top-right-radius: 6px;
  transform: rotate(45deg);
}

.assistant-bubble {
  background-color: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border);
  border-radius: 1rem;
  border-bottom-left-radius: 0.25rem;
  padding: 0.675rem 1.5rem;
  max-width: 70%;
  min-width: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--text);
  word-wrap: break-word;
  display: inline-block;
}

.waiting-indicator {
  display: flex;
  align-items: center;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
}

.typing-dot {
  width: 0.35rem;
  height: 0.35rem;
  background-color: var(--accent);
  border-radius: 50%;
  animation: typing 1.5s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-0.4rem);
    opacity: 1;
  }
}

.markdown-content {
  line-height: 1.55;
}

.markdown-content :deep(p) {
  margin: 0 0 0.4rem 0;
}

.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: var(--bg-tertiary, #e8e8e8);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.8em;
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background-color: var(--bg-tertiary, #e8e8e8);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.35rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.25rem 0;
  padding-left: 1.3rem;
}

.markdown-content :deep(li) {
  margin: 0;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin: 0.35rem 0;
  color: var(--text-muted);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 0.1rem 0 0.05rem 0;
  font-weight: 600;
}

.sources-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.sources-header svg {
  color: var(--accent);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background-color: var(--bg, #fff);
  cursor: pointer;
  transition: all 0.15s ease;
}

.source-item:hover {
  background-color: var(--bg-hover, #f0f0f0);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.source-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  background-color: var(--accent);
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}

.source-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.followups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.followup-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  background-color: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border);
  border-radius: 1rem;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
  font-family: var(--font);
  line-height: 1.2;
}

.followup-chip:hover {
  background-color: color-mix(in srgb, var(--accent) 10%, transparent);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  color: var(--accent);
  transform: translateY(-1px);
}

.followup-chip:active {
  transform: translateY(0);
}

@media screen and (max-width: 768px) {
  .chat-item {
    margin-inline: 0;
    gap: 0.6rem;
    margin-block-end: 1rem;
  }

  .assistant-bubble {
    max-width: 100%;
    box-sizing: border-box;
  }

  .user-bubble {
    max-width: 80%;
  }

  .user-avatar {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    min-height: 2rem;
  }
}

.assistant-avatar {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  min-width: 2.5rem;
  min-height: 2.5rem;
  border-radius: 50%;
  background: var(--bg-tertiary, #e8e8e8);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>