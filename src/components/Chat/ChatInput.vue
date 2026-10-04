```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { SendOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  chat: {
    isLoading: {
      value: boolean
    }
    error: {
      value: Error | undefined
    }
    sendMessage: (message: string) => Promise<void>
  }
}>()

const input = ref('')
const errorMessage = ref('')

const isLoading = computed(() => props.chat.isLoading.value)
const visibleError = computed(() => props.chat.error.value?.message || errorMessage.value)

async function submit() {
  const message = input.value.trim()

  if (!message || isLoading.value) {
    return
  }

  input.value = ''
  errorMessage.value = ''

  try {
    await props.chat.sendMessage(message)
  } catch (error) {
    console.error('Failed to send message:', error)
    errorMessage.value = 'Không thể gửi tin nhắn. Vui lòng thử lại.'
    input.value = message
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()

    void submit()
  }
}
</script>

<template>
  <form class="chat-composer shrink-0 p-3" @submit.prevent="submit">
    <p v-if="visibleError" role="alert" class="mb-2 px-2 text-xs text-red-700">
      {{ visibleError }}
    </p>
    <div class="composer-field flex items-end gap-2 p-2">
      <textarea
        v-model="input"
        rows="1"
        placeholder="Hỏi về thuốc, đơn hàng hoặc sức khỏe..."
        class="composer-textarea max-h-32 min-h-10 flex-1 resize-none px-2 py-2 text-sm outline-none"
        :disabled="isLoading"
        @keydown="handleKeydown"
      />

      <button
        type="submit"
        :disabled="!input.trim() || isLoading"
        class="send-button shrink-0"
        :aria-label="isLoading ? 'Đang gửi tin nhắn' : 'Gửi tin nhắn'"
      >
        <SendOutlined />
      </button>
    </div>

    <p class="composer-hint mt-2 px-2 text-xs">Enter để gửi · Shift + Enter để xuống dòng</p>
  </form>
</template>

<style scoped>
.chat-composer {
  border-top: 1px solid color-mix(in srgb, var(--color-border) 68%, white);
  background: var(--color-card);
}

.composer-field {
  border: 1px solid #cbdde3;
  border-radius: var(--radius-md);
  background: #f8feff;
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base);
}

.composer-field:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px #0891b220;
}

.composer-textarea {
  color: var(--color-foreground);
  background: transparent;
}

.composer-textarea::placeholder {
  color: #758a95;
}

.send-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  transition:
    background-color var(--transition-base),
    box-shadow var(--transition-base),
    transform var(--transition-base);
}

.send-button:hover:not(:disabled) {
  background: #047857;
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.send-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.composer-hint {
  color: var(--color-muted-foreground);
}

@media (prefers-reduced-motion: reduce) {
  .composer-field,
  .send-button {
    transition: none;
  }
}
</style>
```
