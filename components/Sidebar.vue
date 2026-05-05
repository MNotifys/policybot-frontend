<script setup lang="ts">
import { useRouter, useRoute } from 'nuxt/app'
import { useChatStore } from '../stores/chat'
import { useChat } from '../composables/useChat'

const store = useChatStore()
const { newConversation } = useChat()
const router = useRouter()
const route = useRoute()

async function handleNewChat() {
  await newConversation()
  await router.push('/')
}
</script>

<template>
  <header class="sidebar">
    <div class="sidebar__left">
      <span class="sidebar__logo">Policy Bot</span>
    </div>

    <nav class="sidebar__nav">
      <NuxtLink
        to="/"
        class="sidebar__link"
        :class="{ 'sidebar__link--active': route.path === '/' }"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5L12 3l9 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 9.5V21h14V9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10 21v-6h4v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Home
      </NuxtLink>

      <NuxtLink
        to="/history"
        class="sidebar__link"
        :class="{ 'sidebar__link--active': route.path === '/history' }"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/>
          <path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        History
      </NuxtLink>
    </nav>

    <div class="sidebar__right">
      <button class="sidebar__new-chat" @click="handleNewChat">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        New Chat
      </button>
    </div>
  </header>
</template>

<style scoped>
.sidebar {
  height: 56px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--sidebar-border);
  background: var(--sidebar-bg);
  flex-shrink: 0;
  box-sizing: border-box;
}

.sidebar__left {
  flex: 1;
}

.sidebar__logo {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--sidebar-text);
  letter-spacing: -0.3px;
}

.sidebar__nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 34px;
  border-radius: var(--radius-sm);
  color: var(--sidebar-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
}

.sidebar__link:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text);
}

.sidebar__link--active {
  background: var(--sidebar-active);
  color: var(--accent);
}

.sidebar__right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.sidebar__new-chat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--sidebar-text);
  font-family: var(--font);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.sidebar__new-chat:hover {
  background: var(--sidebar-hover);
  border-color: var(--sidebar-border-strong);
}
</style>