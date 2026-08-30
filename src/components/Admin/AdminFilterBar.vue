<template>
    <section class="admin-filter-bar" :aria-label="label">
        <div class="admin-filter-bar__content">
            <slot />
        </div>
        <a-button v-if="$slots.reset" type="link" class="admin-filter-bar__reset" @click="$emit('reset')">
            <slot name="reset">Xóa bộ lọc</slot>
        </a-button>
    </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Bộ lọc' })
defineEmits<{ reset: [] }>()
</script>

<style scoped>
.admin-filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: color-mix(in srgb, var(--color-muted) 55%, var(--color-card));
}

.admin-filter-bar__content {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-wrap: wrap;
    gap: var(--space-sm);
}

.admin-filter-bar__reset {
    flex: 0 0 auto;
    color: var(--color-primary);
    font-weight: 700;
}
</style>
