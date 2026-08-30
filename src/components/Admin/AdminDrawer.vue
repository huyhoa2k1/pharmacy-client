<template>
    <a-drawer class="admin-drawer" :open="open" :title="title" :placement="placement" :width="width"
        :destroy-on-close="destroyOnClose" @update:open="$emit('update:open', $event)" @close="$emit('close')">
        <slot />
        <template v-if="$slots.extra" #extra>
            <slot name="extra" />
        </template>
        <template v-if="$slots.footer" #footer>
            <slot name="footer" />
        </template>
    </a-drawer>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    open: boolean
    title: string
    placement?: 'top' | 'right' | 'bottom' | 'left'
    width?: number | string
    destroyOnClose?: boolean
}>(), {
    placement: 'right',
    width: 480,
    destroyOnClose: true,
})

defineEmits<{
    'update:open': [open: boolean]
    close: []
}>()
</script>

<style scoped>
.admin-drawer :deep(.ant-drawer-header) {
    padding: var(--space-lg);
    border-bottom-color: var(--color-border);
}

.admin-drawer :deep(.ant-drawer-title) {
    color: var(--color-foreground);
    font-family: Figtree, Arial, sans-serif;
    font-size: 1.125rem;
    font-weight: 700;
}

.admin-drawer :deep(.ant-drawer-body) {
    padding: var(--space-lg);
}

.admin-drawer :deep(.ant-drawer-footer) {
    padding: var(--space-md) var(--space-lg);
    border-top-color: var(--color-border);
    background: var(--color-muted);
}

@media (max-width: 640px) {
    .admin-drawer :deep(.ant-drawer-content-wrapper) {
        width: min(100vw, 480px) !important;
    }
}
</style>
