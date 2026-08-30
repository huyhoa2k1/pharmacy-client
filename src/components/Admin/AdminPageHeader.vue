<template>
    <section class="admin-page-header" aria-labelledby="admin-page-title">
        <div>
            <p class="admin-page-header__eyebrow">Hệ thống quản trị</p>
            <h1 id="admin-page-title">{{ title }}</h1>
            <p v-if="description" class="admin-page-header__description">{{ description }}</p>
        </div>
        <div v-if="$slots.actions" class="admin-page-header__actions">
            <slot name="actions" />
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps<{
    title: string
    description?: string
}>()
</script>

<style scoped>
.admin-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-lg);
    padding: var(--space-xl) var(--space-xl) var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-card);
}

.admin-page-header__eyebrow {
    margin: 0 0 var(--space-xs);
    color: var(--color-primary);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

h1 {
    margin: 0;
    color: var(--color-foreground);
    font-size: clamp(1.5rem, 2vw, 2rem);
    font-weight: 700;
    line-height: 1.25;
}

.admin-page-header__description {
    max-width: 44rem;
    margin: var(--space-sm) 0 0;
    color: var(--color-muted-foreground);
    line-height: 1.6;
}

.admin-page-header__actions {
    display: flex;
    flex: 0 0 auto;
    gap: var(--space-sm);
}

@media (max-width: 640px) {
    .admin-page-header {
        flex-direction: column;
        padding: var(--space-lg);
    }

    .admin-page-header__actions {
        width: 100%;
    }
}
</style>
