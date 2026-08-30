<template>
    <div class="admin-data-table" :class="{ 'admin-data-table--loading': loading }">
        <div class="admin-data-table__scroll">
            <a-table v-bind="$attrs" :columns="columns" :data-source="dataSource" :row-key="rowKey"
                :loading="loading" :pagination="false" :scroll="resolvedScroll">
                <template v-for="(_, name) in $slots" #[name]="slotProps">
                    <slot :name="name" v-bind="slotProps || {}" />
                </template>
            </a-table>
        </div>
        <div v-if="$slots.pagination" class="admin-data-table__footer">
            <slot name="pagination" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
    columns: unknown[]
    dataSource: unknown[]
    rowKey?: string | ((record: unknown) => string | number)
    loading?: boolean
    scroll?: Record<string, unknown>
}>(), {
    rowKey: 'id',
    loading: false,
    scroll: () => ({ x: 'max-content' }),
})

const attrs = useAttrs()
const resolvedScroll = computed(() => props.scroll ?? (attrs.scroll as Record<string, unknown>))
</script>

<style scoped>
.admin-data-table {
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-card);
}

.admin-data-table__scroll {
    overflow-x: auto;
}

.admin-data-table :deep(.ant-table) {
    background: transparent;
}

.admin-data-table :deep(.ant-table-thead > tr > th) {
    padding: 14px 16px;
    border-bottom-color: var(--color-border);
    background: var(--color-muted);
    color: var(--color-foreground);
    font-size: 0.8125rem;
    font-weight: 700;
    white-space: nowrap;
}

.admin-data-table :deep(.ant-table-tbody > tr > td) {
    padding: 14px 16px;
    border-bottom-color: color-mix(in srgb, var(--color-border) 55%, transparent);
    color: var(--color-foreground);
}

.admin-data-table :deep(.ant-table-tbody > tr:hover > td) {
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-card)) !important;
}

.admin-data-table__footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-md);
    border-top: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
}

@media (max-width: 640px) {
    .admin-data-table {
        border-radius: var(--radius-sm);
    }

    .admin-data-table :deep(.ant-table-thead > tr > th),
    .admin-data-table :deep(.ant-table-tbody > tr > td) {
        padding: 12px;
    }
}
</style>
