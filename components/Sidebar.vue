<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useChat } from '../composables/useChat'
import { useConversations } from '../composables/useConversations'
import type { Conversation } from '../db'
import { useRoute, useRouter } from 'nuxt/app'

const store = useChatStore()
const { newConversation } = useChat()
const { conversations, deleteConversation } = useConversations()
const router = useRouter()
const route = useRoute()

const collapsed = computed(() => store.sidebarCollapsed)
const recentConversations = computed(() => conversations.value?.slice(0, 20) ?? [])

const pendingDelete = ref<Conversation | null>(null)

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

const MOBILE_BREAKPOINT = 768

function handleResize() {
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    store.sidebarCollapsed = true
  } else {
    store.sidebarCollapsed = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

async function handleNewChat() {
  await newConversation()
  await router.push('/')
}

async function openConversation(conv: Conversation) {
  store.activeConversationId = conv.id!
  if (window.innerWidth < MOBILE_BREAKPOINT) {
    store.sidebarCollapsed = true
  }
  await router.push('/')
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const m = 60_000, h = 3_600_000, d = 86_400_000
  if (diff < m) return 'Just now'
  if (diff < h) return `${Math.floor(diff / m)}m ago`
  if (diff < d) return `${Math.floor(diff / h)}h ago`
  return `${Math.floor(diff / d)}d ago`
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">

    <div class="sidebar__header">
      <Transition name="fade">
        <div v-if="!collapsed" class="sidebar__brand">
          <span class="sidebar__logo">Policy Bot</span>
        </div>
      </Transition>

      <button class="sidebar__toggle" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="store.toggleSidebar()" aria-label="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <div class="sidebar__section">
      <p class="sidebar__recents-label">MAIN</p>
      <NuxtLink class="sidebar__new-chat" @click="handleNewChat" :title="collapsed ? 'New Chat' : undefined">
        <svg class="sidebar__nav-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 10.333A1.333 1.333 0 0 1 12.667 11.667H4.667L2 14.333V3.333A1.333 1.333 0 0 1 3.333 2h9.334A1.333 1.333 0 0 1 14 3.333v7Z"
            stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <Transition name="fade">
          <span v-if="!collapsed">New Chat</span>
        </Transition>
      </NuxtLink>
    </div>

    <nav class="sidebar__nav" role="navigation">
      <NuxtLink to="/" class="sidebar__nav-item" :class="{ 'sidebar__nav-item--active': route.path === '/' }"
        :title="collapsed ? 'Chat' : undefined">
        <svg class="sidebar__nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M5 9.5V21h14V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M10 21v-6h4v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <Transition name="fade">
          <span v-if="!collapsed">Home</span>
        </Transition>
      </NuxtLink>

      <NuxtLink to="/history" class="sidebar__nav-item"
        :class="{ 'sidebar__nav-item--active': route.path === '/history' }" :title="collapsed ? 'History' : undefined">
        <svg class="sidebar__nav-icon" width="18" height="18" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3" />
          <path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
        <Transition name="fade">
          <span v-if="!collapsed">History</span>
        </Transition>
      </NuxtLink>
    </nav>

    <Transition name="fade">
      <div v-if="!collapsed && recentConversations.length" class="sidebar__recents">
        <p class="sidebar__recents-label">Recent</p>
        <ul class="sidebar__conv-list">
          <li v-for="conv in recentConversations" :key="conv.id" class="sidebar__conv-item"
            :class="{ 'sidebar__conv-item--active': conv.id === store.activeConversationId }"
            @click="openConversation(conv)" role="button" tabindex="0" @keydown.enter="openConversation(conv)">
            <span class="sidebar__conv-title">{{ conv.title }}</span>
            <button class="sidebar__conv-delete" title="Delete" @click="requestDelete($event, conv)"
              aria-label="Delete conversation">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </Transition>

  </aside>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="pendingDelete" class="modal-backdrop" @click.self="cancelDelete">
        <div class="modal">
          <div class="modal__icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 5h16M7 5V3.5A.5.5 0 0 1 7.5 3h5a.5.5 0 0 1 .5.5V5M4 5l1 11.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5L16 5"
                stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h2 class="modal__title">Delete conversation?</h2>
          <p class="modal__body">
            "<strong>{{ pendingDelete.title }}</strong>" will be permanently removed.
            This can't be undone.
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
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: 94%;
  overflow: hidden;
  transition: width 0.22s ease, min-width 0.22s ease;
  flex-shrink: 0;
}

.sidebar--collapsed {
  width: var(--sidebar-collapsed);
  min-width: var(--sidebar-collapsed);
}

.sidebar__header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px 0 16px;
  border-bottom: 1px solid var(--sidebar-border);
  flex-shrink: 0;
  gap: 8px;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  min-width: 0;
}

.sidebar__brand-icon {
  width: 58px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sidebar__logo {
  font-weight: 500;
  font-size: 1.45rem;
  color: var(--sidebar-text);
  letter-spacing: -0.3px;
  white-space: nowrap;
  padding-left: 14px;
}

.sidebar__toggle {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--sidebar-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
}

.sidebar__toggle:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text);
}

.sidebar__section {
  padding: 12px 10px 4px;
  flex-shrink: 0;
}

.sidebar__new-chat {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 10px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--sidebar-text);
  font-family: var(--font);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.12s, border-color 0.12s;
}

.sidebar__new-chat:hover {
  background: var(--sidebar-hover);
  border-color: var(--sidebar-border-strong);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 6px 10px;
  gap: 2px;
  flex-shrink: 0;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  height: 36px;
  border-radius: var(--radius-sm);
  color: var(--sidebar-muted);
  text-decoration: none;
  font-size: 0.94rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.12s, color 0.12s;
}

.sidebar__nav-item:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text);
}

.sidebar__nav-item--active {
  background: var(--sidebar-active);
  color: var(--accent);
}

.sidebar__nav-icon {
  flex-shrink: 0;
}

.sidebar__recents {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px 10px 12px;
  /* border-top: 1px solid var(--sidebar-border); */
  margin-top: 6px;
}

.sidebar__recents-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--sidebar-muted);
  padding: 10px 4px 6px;
}

.sidebar__conv-list {
  list-style: none;
  overflow-y: auto;
  flex: 1;
}

.sidebar__conv-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  height: 32px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.1s;
  outline: none;
}

.sidebar__conv-item:hover,
.sidebar__conv-item:focus-visible {
  background: var(--sidebar-hover);
}

.sidebar__conv-item--active {
  background: var(--sidebar-active);
}

.sidebar__conv-title {
  flex: 1;
  font-size: 0.88rem;
  color: var(--sidebar-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.1s;
}

.sidebar__conv-item:hover .sidebar__conv-title,
.sidebar__conv-item--active .sidebar__conv-title {
  color: var(--sidebar-text);
}

.sidebar__conv-delete {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--sidebar-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  flex-shrink: 0;
  transition: opacity 0.1s, background 0.1s, color 0.1s;
}

.sidebar__conv-item:hover .sidebar__conv-delete {
  opacity: 1;
}

.sidebar__conv-delete:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(2px);
}

.modal {
  background: #fff;
  border-radius: 16px;
  padding: 28px 26px 22px;
  width: 320px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.modal__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.modal__title {
  font-size: 1rem;
  font-weight: 650;
  color: var(--text);
  letter-spacing: -0.02em;
}

.modal__body {
  font-size: 0.84rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.modal__actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  width: 100%;
}

.modal__btn {
  flex: 1;
  height: 38px;
  border-radius: 9px;
  border: none;
  font-family: var(--font);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
}

.modal__btn--cancel {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.modal__btn--cancel:hover {
  background: var(--bg-hover);
}

.modal__btn--delete {
  background: #ef4444;
  color: #fff;
}

.modal__btn--delete:hover {
  background: #dc2626;
}
</style>