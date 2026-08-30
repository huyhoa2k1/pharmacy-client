<template>
    <div class="admin-form-field">
        <label v-if="label" class="admin-form-field__label" :for="forId">
            {{ label }}
            <span v-if="required" class="admin-form-field__required" aria-hidden="true">*</span>
        </label>
        <p v-if="description" :id="descriptionId" class="admin-form-field__description">{{ description }}</p>
        <slot />
        <p v-if="error" :id="errorId" class="admin-form-field__error" role="alert">{{ error }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    label?: string
    forId?: string
    description?: string
    error?: string
    required?: boolean
}>()

const descriptionId = computed(() => props.forId ? `${props.forId}-description` : undefined)
const errorId = computed(() => props.forId ? `${props.forId}-error` : undefined)
</script>

<style scoped>
.admin-form-field {
    display: grid;
    gap: var(--space-sm);
}

.admin-form-field__label {
    color: var(--color-foreground);
    font-size: 0.875rem;
    font-weight: 700;
}

.admin-form-field__required,
.admin-form-field__error {
    color: var(--color-destructive);
}

.admin-form-field__description,
.admin-form-field__error {
    margin: calc(var(--space-xs) * -1) 0 0;
    font-size: 0.8125rem;
    line-height: 1.45;
}

.admin-form-field__description {
    color: var(--color-muted-foreground);
}

.admin-form-field__error {
    font-weight: 600;
}
</style>
