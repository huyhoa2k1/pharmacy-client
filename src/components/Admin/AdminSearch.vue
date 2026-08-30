<template>
    <label class="admin-search">
        <span v-if="label" class="sr-only">{{ label }}</span>
        <a-input-search :value="modelValue" :placeholder="placeholder" allow-clear :enter-button="searchLabel"
            @update:value="$emit('update:modelValue', $event)" @search="$emit('search', $event)" />
    </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    searchLabel?: string
}>(), {
    modelValue: '',
    label: 'Tìm kiếm',
    placeholder: 'Tìm kiếm',
    searchLabel: 'Tìm',
})

defineEmits<{
    'update:modelValue': [value: string]
    search: [value: string]
}>()
</script>

<style scoped>
.admin-search {
    display: block;
    width: min(100%, 360px);
}

.admin-search :deep(.ant-input-search) {
    width: 100%;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (max-width: 640px) {
    .admin-search {
        width: 100%;
    }
}
</style>
