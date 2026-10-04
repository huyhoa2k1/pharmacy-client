<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CommentOutlined, CloseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import Chat from './Chat.vue'
import { ChatService, type ChatConversation } from '@/api/services/chat'
import { useUserStore } from '@/stores/user'

const isOpen = ref(false)
const userStore = useUserStore()
const conversations = ref<ChatConversation[]>([])
const activeThreadId = ref('')
const isLoadingConversations = ref(false)
const conversationError = ref('')
const storageKey = computed(() => `pharmacy_chat_thread_id_${userStore.userId}`)

const selectConversation = (conversationId: string) => {
  activeThreadId.value = conversationId
  localStorage.setItem(storageKey.value, conversationId)
}

const loadConversations = async () => {
  isLoadingConversations.value = true
  conversationError.value = ''
  try {
    conversations.value = await ChatService.getConversations()
    if (conversations.value.length === 0) {
      const created = await ChatService.createConversation()
      conversations.value = [created]
      selectConversation(created.id)
      return
    }

    const savedId = localStorage.getItem(storageKey.value)
    const selected =
      conversations.value.find((conversation) => conversation.id === savedId) ??
      conversations.value[0]
    selectConversation(selected.id)
  } catch (error) {
    console.error('Failed to load conversations:', error)
    conversationError.value = 'Không tải được lịch sử trò chuyện.'
  } finally {
    isLoadingConversations.value = false
  }
}

const createConversation = async () => {
  try {
    const created = await ChatService.createConversation()
    conversations.value = [created, ...conversations.value]
    selectConversation(created.id)
  } catch (error) {
    console.error('Failed to create conversation:', error)
    conversationError.value = 'Không thể tạo cuộc trò chuyện mới.'
  }
}

const deleteConversation = async () => {
  if (!activeThreadId.value || !window.confirm('Xóa cuộc trò chuyện này?')) {
    return
  }

  try {
    await ChatService.deleteConversation(activeThreadId.value)
    conversations.value = conversations.value.filter(
      (conversation) => conversation.id !== activeThreadId.value,
    )
    if (conversations.value.length === 0) {
      const created = await ChatService.createConversation()
      conversations.value = [created]
      selectConversation(created.id)
    } else {
      selectConversation(conversations.value[0].id)
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error)
    conversationError.value = 'Không thể xóa cuộc trò chuyện.'
  }
}

const onConversationChange = (event: Event) => {
  const target = event.target
  if (target instanceof HTMLSelectElement) {
    selectConversation(target.value)
  }
}

const requestSignIn = () => {
  window.dispatchEvent(new CustomEvent('pharmacy:open-auth'))
}

watch([isOpen, () => userStore.userId, () => userStore.isLogin], ([opened, , loggedIn]) => {
  if (opened && loggedIn) {
    void loadConversations()
  }
})
</script>

<template>
  <Transition name="chat">
    <section
      v-if="isOpen"
      class="chat-panel fixed bottom-24 right-5 z-50 flex h-[min(640px,calc(100dvh-7rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden"
      aria-label="Trợ lý chăm sóc sức khỏe"
    >
      <div
        v-if="userStore.isLogin"
        class="conversation-bar flex shrink-0 items-center gap-2 px-4 py-3"
      >
        <select
          :value="activeThreadId"
          :disabled="isLoadingConversations || conversations.length === 0"
          class="conversation-select min-w-0 flex-1"
          aria-label="Chọn cuộc trò chuyện"
          @change="onConversationChange"
        >
          <option
            v-for="conversation in conversations"
            :key="conversation.id"
            :value="conversation.id"
          >
            {{ conversation.title }}
          </option>
        </select>
        <button
          type="button"
          title="Cuộc trò chuyện mới"
          aria-label="Cuộc trò chuyện mới"
          class="chat-icon-button"
          @click="createConversation"
        >
          <PlusOutlined />
        </button>
        <button
          type="button"
          title="Xóa cuộc trò chuyện"
          aria-label="Xóa cuộc trò chuyện"
          :disabled="!activeThreadId"
          class="chat-icon-button chat-icon-button--danger"
          @click="deleteConversation"
        >
          <DeleteOutlined />
        </button>
      </div>
      <p v-if="conversationError" role="alert" class="chat-error shrink-0 px-4 py-2 text-xs">
        {{ conversationError }}
      </p>
      <div
        v-if="!userStore.isLogin"
        class="chat-sign-in flex flex-1 flex-col items-center justify-center px-8 text-center"
      >
        <div class="chat-sign-in__icon"><CommentOutlined /></div>
        <h2>Trò chuyện cùng dược sĩ AI</h2>
        <p>Đăng nhập để nhận tư vấn phù hợp và lưu lại các cuộc trò chuyện của bạn.</p>
        <button type="button" class="chat-sign-in__button" @click="requestSignIn">Đăng nhập</button>
      </div>
      <div v-else-if="activeThreadId" class="min-h-0 flex-1">
        <Chat :key="activeThreadId" :thread-id="activeThreadId" />
      </div>
    </section>
  </Transition>

  <button
    class="chat-launcher fixed bottom-5 right-5 z-50 flex items-center justify-center"
    :aria-label="isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'"
    :aria-expanded="isOpen"
    @click="isOpen = !isOpen"
  >
    <CloseOutlined v-if="isOpen" />
    <CommentOutlined v-else />
  </button>
</template>

<style scoped>
.chat-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-card);
  box-shadow: var(--shadow-xl);
}

.conversation-bar {
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 70%, white);
  background: var(--color-card);
}

.conversation-select {
  height: 40px;
  border: 1px solid #cbdde3;
  border-radius: var(--radius-sm);
  background: #f8feff;
  color: var(--color-foreground);
  font-size: 0.8125rem;
  outline: none;
  padding: 0 0.75rem;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.conversation-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px #0891b220;
}

.chat-icon-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbdde3;
  border-radius: var(--radius-sm);
  background: #f8feff;
  color: var(--color-foreground);
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base);
}

.chat-icon-button:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: #e8faff;
  color: var(--color-primary);
}

.chat-icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.chat-icon-button--danger:hover:not(:disabled) {
  border-color: var(--color-destructive);
  background: #fef2f2;
  color: var(--color-destructive);
}

.chat-error {
  border-bottom: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.chat-sign-in {
  background: linear-gradient(145deg, #f7feff 0%, var(--color-card) 58%);
}

.chat-sign-in__icon {
  display: flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-md);
  border-radius: 18px;
  background: var(--color-primary);
  box-shadow:
    -5px -5px 12px #fff,
    5px 5px 12px #b9e6ec;
  color: #fff;
  font-size: 1.5rem;
}

.chat-sign-in h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.chat-sign-in p {
  max-width: 300px;
  margin: var(--space-sm) 0 var(--space-lg);
  color: var(--color-muted-foreground);
  font-size: 0.875rem;
  line-height: 1.6;
}

.chat-sign-in__button {
  min-height: 44px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0 1.25rem;
  transition:
    background-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.chat-sign-in__button:hover {
  background: #047857;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.chat-launcher {
  width: 58px;
  height: 58px;
  border: 1px solid #fff;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.32);
  color: #fff;
  cursor: pointer;
  font-size: 1.375rem;
  transition:
    background-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.chat-launcher:hover {
  background: #047857;
  box-shadow: 0 10px 24px rgba(5, 150, 105, 0.38);
  transform: translateY(-2px);
}

.chat-enter-active,
.chat-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.chat-enter-from,
.chat-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 480px) {
  .chat-panel {
    right: 1rem;
    bottom: 5.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-enter-active,
  .chat-leave-active,
  .chat-launcher,
  .chat-icon-button,
  .chat-sign-in__button,
  .conversation-select {
    transition: none;
  }
}
</style>
