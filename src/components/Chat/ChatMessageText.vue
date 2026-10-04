<script setup lang="ts">
import { TextPart } from '@tanstack/ai-vue/ui'

defineProps<{
    content: string
}>()
</script>

<template>
    <TextPart :content="content" class="chat-markdown" />
</template>
