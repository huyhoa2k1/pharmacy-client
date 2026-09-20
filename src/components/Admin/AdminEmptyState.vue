<template>
    <section class="admin-state admin-state--empty">
        <a-empty :image="image">
            <template #description>
                <h2>{{ title || t('adminCommon.noDataTitle') }}</h2>
                <p>{{ description || t('adminCommon.noDataDescription') }}</p>
            </template>
            <slot name="action" />
        </a-empty>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withDefaults(defineProps<{
    title?: string
    description?: string
    image?: string
}>(), {
    title: '',
    description: '',
    image: '',
})
</script>

<style scoped>
.admin-state {
    display: grid;
    min-height: 280px;
    place-items: center;
    padding: var(--space-xl);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-muted) 35%, var(--color-card));
    text-align: center;
}

h2,
p {
    margin: 0;
}

h2 {
    color: var(--color-foreground);
    font-size: 1rem;
    font-weight: 700;
}

p {
    max-width: 28rem;
    margin-top: var(--space-xs);
    color: var(--color-muted-foreground);
}
</style>
