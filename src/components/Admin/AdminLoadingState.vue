<template>
    <section class="admin-state admin-loading-state" :aria-label="label" aria-busy="true">
        <a-spin size="large" />
        <p>{{ label }}</p>
    </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Đang tải dữ liệu...' })
</script>

<style scoped>
.admin-state {
    display: grid;
    min-height: 280px;
    place-items: center;
    align-content: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-card);
}

p {
    margin: 0;
    color: var(--color-muted-foreground);
    font-weight: 600;
}
</style>
