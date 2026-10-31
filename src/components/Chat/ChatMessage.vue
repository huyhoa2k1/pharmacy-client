<script setup lang="ts">
import { computed } from 'vue'
import { RobotOutlined, UserOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  message: {
    id: string
    role: string
  }
}>()

const isUser = computed(() => props.message.role === 'user')
</script>

<template>
  <article
    class="chat-message flex w-full gap-2 px-4 py-2"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <div v-if="!isUser" class="message-avatar message-avatar--assistant" aria-hidden="true">
      <RobotOutlined />
    </div>
    <div class="max-w-[82%]">
      <div v-if="!isUser" class="message-sender">Trợ lý sức khỏe</div>
      <div
        class="message-bubble"
        :class="isUser ? 'message-bubble--user' : 'message-bubble--assistant'"
      >
        <div class="chat-message-content">
          <slot />
        </div>
      </div>
    </div>
    <div v-if="isUser" class="message-avatar message-avatar--user" aria-hidden="true">
      <UserOutlined />
    </div>
  </article>
</template>

<style scoped>
.chat-message {
  align-items: flex-end;
}

.message-avatar {
  display: flex;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8125rem;
}

.message-avatar--assistant {
  background: color-mix(in srgb, var(--color-primary) 18%, var(--color-card));
  color: var(--color-link);
}

.message-avatar--user {
  background: var(--color-success-bg);
  color: var(--color-accent-text);
}

.message-sender {
  margin: 0 0 var(--space-xs);
  color: var(--color-muted-foreground);
  font-size: 0.6875rem;
  font-weight: 700;
}

.message-bubble {
  padding: 0.7rem 0.875rem;
  border-radius: 14px;
  font-size: 0.875rem;
  line-height: 1.55;
}

.message-bubble--assistant {
  border: 1px solid var(--color-border);
  border-bottom-left-radius: 4px;
  background: var(--color-muted);
  color: var(--color-card-foreground);
}

.message-bubble--user {
  border-bottom-right-radius: 4px;
  background: var(--color-primary-solid);
  color: #fff;
}
</style>
