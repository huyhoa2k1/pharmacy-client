<template>
    <section class="admin-state admin-loading-state" :aria-label="label || t('adminCommon.loadingData')"
        aria-busy="true">
        <a-spin size="large" />
        <p>{{ label || t('adminCommon.loadingData') }}</p>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ label?: string }>()
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
