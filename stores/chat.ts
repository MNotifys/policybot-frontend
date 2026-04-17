import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const activeConversationId = ref<number | null>(null)
  const isStreaming = ref(false)
  const activeSessionId = ref<string | null>(null)

  // Sidebar collapse — persisted in localStorage so it survives page reload
  const sidebarCollapsed = ref<boolean>(
    import.meta.client
      ? localStorage.getItem('sidebar-collapsed') === 'true'
      : false
  )

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
    if (import.meta.client) {
      localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed.value))
    }
  }

  return {
    activeConversationId,
    activeSessionId,
    isStreaming,
    sidebarCollapsed,
    toggleSidebar,
  }
})
