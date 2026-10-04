```vue
<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { fetchServerSentEvents } from '@tanstack/ai-vue'

import { createChatHook, UIChat } from '@tanstack/ai-vue/ui'

import ChatMessage from './ChatMessage.vue'
import ChatMessageText from './ChatMessageText.vue'
import ChatInput from './ChatInput.vue'
import { BASE_URL } from '@/helpers/https'

defineOptions({
  name: 'PharmacyChat',
})

const props = defineProps<{
  threadId: string
}>()

const chatOptions = {
  connection: fetchServerSentEvents(`${BASE_URL}/chat`, () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
    },
  })),
  persistence: true,
  threadId: props.threadId,
}

const Layout = defineComponent({
  setup(_, { slots }) {
    return () =>
      h(
        'div',
        {
          class: 'flex h-full min-h-0 flex-col chat-surface',
        },
        [
          h(
            'div',
            {
              class: 'chat-header flex shrink-0 items-center px-4 py-3',
            },
            [
              h(
                'div',
                {
                  class:
                    'chat-header__avatar flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white',
                },
                'AI',
              ),

              h(
                'span',
                {
                  class: 'ml-3 font-semibold text-slate-800',
                },
                'Trợ lý sức khỏe',
              ),
            ],
          ),

          h(
            'div',
            {
              class: 'chat-messages min-h-0 flex-1 overflow-y-auto py-3',
            },
            [slots.messages?.(), slots.interrupts?.(), slots.queue?.()],
          ),
        ],
      )
  },
})

const Message = defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
  },

  setup(props, { slots }) {
    return () =>
      h(
        ChatMessage,
        {
          message: props.message as {
            id: string
            role: string
          },
        },
        {
          default: () => slots.parts?.(),
        },
      )
  },
})

const Text = defineComponent({
  props: {
    part: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    return () =>
      h(ChatMessageText, {
        content: String((props.part as { content?: string }).content ?? ''),
      })
  },
})

const Fallback = defineComponent({
  props: {
    part: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    return () =>
      h(
        'span',
        {
          class: 'text-gray-500',
        },
        `[${String((props.part as { type?: string }).type ?? '')}]`,
      )
  },
})

const { useAppChat, ui } = createChatHook({
  options: chatOptions,

  components: {
    layout: Layout,
    message: Message,
  },

  partsComponents: {
    text: Text,
    fallback: Fallback,
  },
})

const chat = useAppChat()
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-white">
    <div class="min-h-0 flex-1">
      <UIChat :ui="ui" :chat="chat" />
    </div>

    <ChatInput :chat="chat" />
  </div>
</template>

<style scoped>
:deep(.chat-surface) {
  background: var(--color-card);
}

:deep(.chat-header) {
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 68%, white);
  background: linear-gradient(100deg, #effcff, #fff);
}

:deep(.chat-header__avatar) {
  background: var(--color-primary);
  box-shadow:
    -3px -3px 8px #fff,
    3px 3px 8px #b7e6ec;
}

:deep(.chat-messages) {
  background: #fcfeff;
  scrollbar-color: #9edce7 transparent;
  scrollbar-width: thin;
}
</style>
