<template>
    <a-modal class="admin-modal" :open="open" :title="title" :ok-text="okText" :cancel-text="cancelText"
        :confirm-loading="loading" :destroy-on-close="destroyOnClose" @update:open="$emit('update:open', $event)"
        @ok="$emit('confirm')" @cancel="$emit('cancel')">
        <slot />
        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </a-modal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    open: boolean
    title: string
    okText?: string
    cancelText?: string
    loading?: boolean
    destroyOnClose?: boolean
}>(), {
    okText: 'Lưu',
    cancelText: 'Hủy',
    loading: false,
    destroyOnClose: true,
})

defineEmits<{
    'update:open': [open: boolean]
    confirm: []
    cancel: []
}>()
</script>

<style scoped>
.admin-modal :deep(.ant-modal-header) {
    padding: var(--space-lg) var(--space-lg) var(--space-md);
    border-bottom: 1px solid var(--color-border);
}

.admin-modal :deep(.ant-modal-title) {
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
}

.admin-modal :deep(.ant-modal-body) {
    padding: var(--space-lg);
}

.admin-modal :deep(.ant-modal-footer) {
    padding: var(--space-md) var(--space-lg) var(--space-lg);
    border-top: 1px solid var(--color-border);
}
</style>
