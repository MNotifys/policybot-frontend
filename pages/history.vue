<script setup lang="ts">
import { useConversations } from '../composables/useConversations'
import { useChatStore } from '../stores/chat'
import type { Conversation } from '../db'
import { ref, computed } from 'vue'
import { useRouter } from 'nuxt/app'

const store = useChatStore()
const router = useRouter()
const { conversations, deleteConversation } = useConversations()

const pendingDelete = ref<Conversation | null>(null)
const searchQuery = ref('')

const DAY = 86_400_000
const WEEK = 7 * DAY

const filteredConversations = computed(() => {
  if (!conversations.value) return []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter((c: Conversation) => c.title.toLowerCase().includes(q))
})

const todayConversations = computed(() =>
  filteredConversations.value.filter((c: Conversation) => Date.now() - c.updatedAt < DAY)
)

const earlierConversations = computed(() =>
  filteredConversations.value.filter((c: Conversation) => Date.now() - c.updatedAt >= DAY)
)

function formatDate(ts: number): string {
  const diff = Date.now() - ts
  const m = 60_000, h = 3_600_000

  if (diff < m) return 'Just now'
  if (diff < h) return `${Math.floor(diff / m)}m ago`
  if (diff < DAY) return `${Math.floor(diff / h)}h ago`
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d ago`
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: diff > 365 * DAY ? 'numeric' : undefined,
  })
}

async function openConversation(conv: Conversation) {
  store.activeConversationId = conv.id!
  await router.push('/')
}

function requestDelete(e: MouseEvent, conv: Conversation) {
  e.stopPropagation()
  pendingDelete.value = conv
}

async function confirmDelete() {
  if (!pendingDelete.value) return
  await deleteConversation(pendingDelete.value.id!)
  if (store.activeConversationId === pendingDelete.value.id) {
    store.activeConversationId = null
  }
  pendingDelete.value = null
}

function cancelDelete() {
  pendingDelete.value = null
}
</script>

<template>
  <div class="history-page">

    <div class="history-page__header">
      <div class="history-page__header-text">
        <h1 class="history-page__title">History</h1>
        <p class="history-page__sub">
          {{ conversations?.length ?? 0 }} conversation{{ (conversations?.length ?? 0) !== 1 ? 's' : '' }}
        </p>
      </div>
    </div>

    <div v-if="conversations?.length" class="history-page__filter-bar">
      <div class="history-page__search-wrap">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="history-page__search-icon">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
        </svg>
        <input
          v-model="searchQuery"
          class="history-page__search"
          type="text"
          placeholder="Search conversations…"
        />
      </div>
    </div>

    <div v-if="!conversations?.length" class="history-page__empty">
      <div class="history-page__empty-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M28 21A2.667 2.667 0 0 1 25.333 23.333H9.333L4 29V6.667A2.667 2.667 0 0 1 6.667 4h18.666A2.667 2.667 0 0 1 28 6.667V21Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <p class="history-page__empty-title">No conversations yet</p>
      <p class="history-page__empty-sub">Start chatting and your history will appear here.</p>
      <NuxtLink to="/" class="history-page__cta">Start a conversation</NuxtLink>
    </div>

    <div v-else-if="!filteredConversations.length" class="history-page__empty">
      <p class="history-page__empty-title">No results</p>
      <p class="history-page__empty-sub">No conversations match "{{ searchQuery }}".</p>
    </div>

    <template v-else>
      <template v-if="todayConversations.length">
        <p class="history-page__group-label">Today</p>
        <ul class="history-page__list">
          <li
            v-for="conv in todayConversations"
            :key="conv.id"
            class="conv-card"
            :class="{ 'conv-card--active': conv.id === store.activeConversationId }"
            @click="openConversation(conv)"
            role="button"
            tabindex="0"
            @keydown.enter="openConversation(conv)"
          >
            <div class="conv-card__icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M12.333 9A1.167 1.167 0 0 1 11.167 10.167H4.083L1.75 12.5V3A1.167 1.167 0 0 1 2.917 1.833h8.25A1.167 1.167 0 0 1 12.333 3v6Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="conv-card__body">
              <p class="conv-card__title">{{ conv.title }}</p>
              <time class="conv-card__date">{{ formatDate(conv.updatedAt) }}</time>
            </div>
            <div class="conv-card__actions">
              <div v-if="conv.id === store.activeConversationId" class="conv-card__badge">
                Active
              </div>
              <button
                class="conv-card__delete"
                title="Delete conversation"
                @click="requestDelete($event, conv)"
                aria-label="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 3h11M4.5 3V2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M2.5 3l.7 7.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L10.5 3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </template>

      <template v-if="earlierConversations.length">
        <p class="history-page__group-label">Earlier</p>
        <ul class="history-page__list">
          <li
            v-for="conv in earlierConversations"
            :key="conv.id"
            class="conv-card"
            :class="{ 'conv-card--active': conv.id === store.activeConversationId }"
            @click="openConversation(conv)"
            role="button"
            tabindex="0"
            @keydown.enter="openConversation(conv)"
          >
            <div class="conv-card__icon" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M12.333 9A1.167 1.167 0 0 1 11.167 10.167H4.083L1.75 12.5V3A1.167 1.167 0 0 1 2.917 1.833h8.25A1.167 1.167 0 0 1 12.333 3v6Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="conv-card__body">
              <p class="conv-card__title">{{ conv.title }}</p>
              <time class="conv-card__date">{{ formatDate(conv.updatedAt) }}</time>
            </div>
            <div class="conv-card__actions">
              <div v-if="conv.id === store.activeConversationId" class="conv-card__badge">
                Active
              </div>
              <button
                class="conv-card__delete"
                title="Delete conversation"
                @click="requestDelete($event, conv)"
                aria-label="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 3h11M4.5 3V2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M2.5 3l.7 7.5a.5.5 0 0 0 .5.5h5.6a.5.5 0 0 0 .5-.5L10.5 3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
      </template>
    </template>

  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="pendingDelete" class="modal-backdrop" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M2 5h16M7 5V3.5A.5.5 0 0 1 7.5 3h5a.5.5 0 0 1 .5.5V5M4 5l1 11.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5L16 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h2 class="modal__title">Delete conversation?</h2>
          <p class="modal__body">
            <strong class="modal__conv-name">{{ pendingDelete.title }}</strong> will be permanently removed and cannot be recovered.
          </p>
          <div class="modal__actions">
            <button class="modal__btn modal__btn--cancel" @click="cancelDelete">Cancel</button>
            <button class="modal__btn modal__btn--delete" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>

.history-page {
  flex: 1;
  overflow-y: auto;
  padding: 40px 40px 64px;
  margin: 0 auto;
  width: 100%;
}

.history-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.history-page__title {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: var(--text);
  line-height: 1;
  margin-bottom: 5px;
}

.history-page__sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 400;
  letter-spacing: 0.01em;
}

/* ── Search ── */
.history-page__filter-bar {
  margin-bottom: 28px;
}

.history-page__search-wrap {
  position: relative;
}

.history-page__search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.history-page__search {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: var(--bg-secondary, var(--bg));
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 400;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.history-page__search:focus {
  border-color: var(--accent, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
}

.history-page__search::placeholder {
  color: var(--text-muted);
}

/* ── Group labels ── */
.history-page__group-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0 2px;
  margin-bottom: 6px;
  margin-top: 24px;
}

.history-page__group-label:first-of-type {
  margin-top: 0;
}

/* ── List ── */
.history-page__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Empty state ── */
.history-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 80px 0;
  text-align: center;
}

.history-page__empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--bg-secondary, var(--bg-tertiary));
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.history-page__empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.history-page__empty-sub {
  font-size: 0.83rem;
  color: var(--text-muted);
  font-weight: 400;
}

.history-page__cta {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: var(--accent, #6366f1);
  color: var(--accent-fg, #fff);
  border-radius: 8px;
  font-size: 0.83rem;
  font-weight: 500;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: opacity 0.15s;
}

.history-page__cta:hover {
  opacity: 0.88;
}

/* ── Conversation card ── */
.conv-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px 10px 14px;
  border: 1px solid transparent;
  border-radius: 9px;
  cursor: pointer;
  background: transparent;
  transition: background 0.12s, border-color 0.12s;
  outline: none;
  position: relative;
}

.conv-card:hover {
  background: var(--bg-secondary, rgba(0,0,0,0.03));
  border-color: var(--border);
}

.conv-card:focus-visible {
  border-color: var(--accent, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #6366f1) 12%, transparent);
}

.conv-card--active {
  background: var(--bg-secondary, rgba(0,0,0,0.03));
  border-color: var(--border);
}

.conv-card--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 48%;
  width: 2px;
  background: var(--accent, #6366f1);
  border-radius: 0 2px 2px 0;
}

.conv-card__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
}

.conv-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.conv-card__title {
  font-size: 0.855rem;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.01em;
}

.conv-card__date {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 400;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Card right-side actions ── */
.conv-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.conv-card__badge {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--bg-tertiary, rgba(0,0,0,0.06));
  color: var(--text-muted);
  border: 1px solid var(--border);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.conv-card__delete {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border);
  background: var(--bg-secondary, rgba(0,0,0,0.03));
  border-radius: 7px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.conv-card__delete:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444;
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg);
  border-radius: 14px;
  padding: 26px 24px 22px;
  width: 340px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  border: 1px solid var(--border);
}

.modal__icon {
  width: 42px;
  height: 42px;
  border-radius: 11px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  border: 1px solid #fca5a5;
}

.modal__title {
  font-size: 0.97rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.02em;
  font-family: 'DM Sans', var(--font, sans-serif);
}

.modal__body {
  font-size: 0.82rem;
  color: var(--text-secondary, var(--text-muted));
  line-height: 1.6;
  max-width: 270px;
  font-weight: 400;
}

.modal__conv-name {
  font-weight: 600;
  color: var(--text);
}

.modal__actions {
  display: flex;
  gap: 7px;
  margin-top: 8px;
  width: 100%;
}

.modal__btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  border: none;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.12s;
  letter-spacing: -0.01em;
}

.modal__btn--cancel {
  background: var(--bg-tertiary, rgba(0,0,0,0.05));
  color: var(--text-secondary, var(--text-muted));
  border: 1px solid var(--border);
}

.modal__btn--cancel:hover {
  opacity: 0.75;
}

.modal__btn--delete {
  background: #ef4444;
  color: #fff;
}

.modal__btn--delete:hover {
  opacity: 0.88;
}

/* ── Transitions ── */
.modal-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.modal-leave-active {
  transition: opacity 0.14s ease, transform 0.12s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>