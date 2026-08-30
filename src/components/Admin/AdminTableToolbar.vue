<template>
    <div class="admin-table-toolbar">
        <div class="admin-table-toolbar__filters">
            <slot name="search" />
            <slot name="filters" />
        </div>
        <div v-if="$slots.actions" class="admin-table-toolbar__actions">
            <slot name="actions" />
        </div>
    </div>
</template>

<style scoped>
.admin-table-toolbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
}

.admin-table-toolbar__filters,
.admin-table-toolbar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.admin-table-toolbar__filters {
    flex: 1 1 auto;
    min-width: 0;
}

.admin-table-toolbar__actions {
    flex: 0 0 auto;
}

@media (max-width: 640px) {
    .admin-table-toolbar,
    .admin-table-toolbar__actions {
        align-items: stretch;
        flex-direction: column;
    }

    .admin-table-toolbar__actions :deep(.ant-btn) {
        width: 100%;
    }
}
</style>
