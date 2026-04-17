<script setup lang="ts">
import { ref, nextTick } from 'vue'

const props = defineProps<{
  disabled?: boolean
  centered?: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}

async function submit() {
  const value = input.value.trim()
  if (!value || props.disabled) return
  emit('send', value)
  input.value = ''
  await nextTick()
  resizeTextarea()
}

function resizeTextarea() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 180) + 'px'
}
</script>

<template>
  <div class="input-wrap" :class="{ 'input-wrap--centered': centered }">

    <Transition name="fade">
      <div v-if="centered" class="input-wrap__greeting">
        <h1 class="input-wrap__heading">Welcome to <span class="input-wrap__span">Entrepreneurship Policy Bot</span>
        </h1>
      </div>
    </Transition>

    <div class="input-box" :class="{ 'input-box--elevated': centered }">
      <textarea ref="textareaRef" v-model="input" class="input-box__textarea"
        :placeholder="centered ? 'Ask me about the policy ecosystem…' : 'know more about policies……'" :disabled="disabled" rows="1"
        @keydown="handleKeydown" @input="resizeTextarea" autofocus />

      <div class="input-box__actions">
        <button v-if="disabled" class="input-box__btn input-box__btn--stop" @click="emit('stop')"
          aria-label="Stop generating" title="Stop generating">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="9" height="9" rx="1.5" fill="currentColor" />
          </svg>
        </button>

        <button v-else class="input-box__btn input-box__btn--send" :disabled="!input.trim()" @click="submit"
          aria-label="Send message">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 12.5V2.5M7.5 2.5L3 7M7.5 2.5L12 7" stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="centered" class="input-wrap__hint">
      Press Enter to send · Shift+Enter for new line
    </p>

  </div>
</template>

<style scoped>
.input-wrap {
  padding: 10px 20px 14px;
  background: var(--bg);
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}

.input-wrap--centered {
  border-top: none;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 200px;
  gap: 20px;
  width: 100%;
}

.input-wrap__greeting {
  text-align: center;
}

.input-wrap__heading {
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text);
  margin-bottom: 0.4rem;
}

.input-wrap__sub {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.input-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 680px;
  margin: 0 auto 0.5rem;
  background: var(--bg-secondary);
  border: 1.5px solid var(--border);
  border-radius: 1rem;
  overflow: hidden;
  padding-inline-end: 0.75rem;
  transition: border-color 0.2s ease-in-out;
}

.input-box:hover,
.input-box:focus-within {
  border-color: var(--accent);
}

.input-box--elevated {
  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.12));
}

.input-box__textarea {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text);
  resize: none;
  outline: none;
  padding: 1.25rem 0 1.25rem 1.25rem;
  min-height: 4rem;
  max-height: 6rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.input-box__textarea::placeholder {
  color: var(--text-muted);
}

.input-box__textarea:disabled {
  opacity: 0.5;
  cursor: default;
}

.input-box__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.input-box__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  font-family: var(--font);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  border-radius: 50%;
}

.input-box__btn--send {
  width: 2.75rem;
  height: 2.75rem;
  background: var(--accent);
  color: var(--accent-fg, #fff);
  padding: 0;
}

.input-box__btn--send:hover:not(:disabled) {
  background: var(--accent-hover, color-mix(in srgb, var(--accent) 85%, #000));
  transform: scale(1.05);
}

.input-box__btn--send:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.input-box__btn--stop {
  border-radius: 8px;
  padding: 0 12px;
  height: 2.25rem;
  background: var(--bg-tertiary, #f3f3f3);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.input-box__btn--stop:hover {
  background: var(--bg-hover, #e8e8e8);
  color: var(--text);
}

.input-wrap__hint {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.input-wrap__span {
  display: inline-block;
  background: linear-gradient(3deg, #0d9488, #0f766e);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
</style>