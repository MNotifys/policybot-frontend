<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useChatStore } from '../stores/chat'
import { useChat } from '../composables/useChat'
import { useMessages } from '../composables/useConversations'
import ChatWindow from '../components/ChatWindow.vue'
import ChatInput from '../components/ChatInput.vue'

const store = useChatStore()
const { sendMessage, newConversation, stopStreaming } = useChat()
const { messages } = useMessages(computed(() => store.activeConversationId))

const hasMessages = computed(() => (messages.value?.length ?? 0) > 0)

onMounted(() => {
})

async function handleSend(content: string) {
  if (!store.activeConversationId) {
    await newConversation()
  }
  await sendMessage(content)
}
</script>

<template>
  <div class="chat-page" :class="{ 'chat-page--landing': !hasMessages }">

    <Transition name="fade" mode="out-in">
      <div v-if="!hasMessages" class="chat-page__landing">
        <ChatInput centered :disabled="store.isStreaming" @send="handleSend" @stop="stopStreaming" />
      </div>

      <div v-else class="chat-page__active">
        <ChatWindow :messages="messages ?? []" />
        <ChatInput :disabled="store.isStreaming" @send="handleSend" @stop="stopStreaming" />
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.chat-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.chat-page__landing {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
}

.chat-page__active {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  padding: 36px 28px;

}
</style>