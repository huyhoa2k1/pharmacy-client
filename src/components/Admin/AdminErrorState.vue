<template>
    <section class="admin-state admin-error-state" role="alert">
        <div class="admin-error-state__icon" aria-hidden="true">
            <WarningOutlined />
        </div>
        <div>
            <h2>{{ title || t('adminCommon.loadErrorTitle') }}</h2>
            <p>{{ description || t('adminCommon.loadErrorDescription') }}</p>
        </div>
        <a-button v-if="$slots.action" type="primary" @click="$emit('retry')">
            <slot name="action">{{ t('adminCommon.retry') }}</slot>
        </a-button>
    </section>
</template>

<script setup lang="ts">
import { WarningOutlined } from '@ant-design/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

withDefaults(defineProps<{
    title?: string
    description?: string
}>(), {
    title: '',
    description: '',
})

defineEmits<{ retry: [] }>()
</script>

<style scoped>
.admin-state {
    display: grid;
    min-height: 280px;
    place-items: center;
    align-content: center;
    gap: var(--space-md);
    padding: var(--space-xl);
    border: 1px solid color-mix(in srgb, var(--color-destructive) 35%, var(--color-card));
    border-radius: var(--radius-md);
    background: color-mix(in srgb, var(--color-destructive) 4%, var(--color-card));
    text-align: center;
}

.admin-error-state__icon {
    display: grid;
    width: 44px;
    height: 44px;
    place-items: center;
    border-radius: 50%;
    background: #fee2e2;
    color: var(--color-destructive);
    font-size: 1.25rem;
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
