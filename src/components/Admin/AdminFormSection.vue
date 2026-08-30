<template>
    <section class="admin-form-section" :aria-labelledby="headingId">
        <header v-if="title || description" class="admin-form-section__header">
            <h2 v-if="title" :id="headingId">{{ title }}</h2>
            <p v-if="description">{{ description }}</p>
        </header>
        <div class="admin-form-section__content">
            <slot />
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ title?: string; description?: string; id?: string }>()
const headingId = computed(() => props.id ?? 'admin-form-section')
</script>

<style scoped>
.admin-form-section {
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-card);
}

.admin-form-section__header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-muted) 45%, var(--color-card));
}

h2,
p {
    margin: 0;
}

h2 {
    font-size: 1rem;
    font-weight: 700;
}

p {
    margin-top: var(--space-xs);
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
    line-height: 1.5;
}

.admin-form-section__content {
    padding: var(--space-lg);
}
</style>
