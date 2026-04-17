<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { VList } from 'virtua/vue'
import MessageBubble from './MessageBubble.vue'
import type { Message } from '../db'

const props = defineProps<{ messages: Message[] }>()

const listRef = ref<InstanceType<typeof VList> | null>(null)
const count = computed(() => props.messages?.length ?? 0)

watch(
  () => [count.value, props.messages[count.value - 1]?.content?.length],
  async () => {
    if (!listRef.value || count.value === 0) return
    await nextTick()
    listRef.value.scrollToIndex(count.value - 1, { align: 'end', smooth: true })
  }
)
</script>

<template>
  <div class="chat-window">
    <VList
      ref="listRef"
      :data="messages"
      :overscan="5"
      style="height: 100%; flex: 1;"
    >
      <template #default="{ item }">
        <MessageBubble :message="(item as Message)" />
      </template>
    </VList>
  </div>
</template>

<style scoped>
.chat-window {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
