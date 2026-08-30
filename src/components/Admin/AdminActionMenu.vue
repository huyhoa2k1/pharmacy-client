<template>
    <a-dropdown :trigger="['click']">
        <a-button class="admin-action-menu__trigger" type="text" :aria-label="label">
            <template #icon><MoreOutlined /></template>
        </a-button>
        <template #overlay>
            <a-menu @click="handleClick">
                <a-menu-item v-for="item in items" :key="item.key" :danger="item.danger" :disabled="item.disabled">
                    {{ item.label }}
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { MoreOutlined } from '@ant-design/icons-vue'

type ActionItem = {
    key: string
    label: string
    danger?: boolean
    disabled?: boolean
}

withDefaults(defineProps<{
    items: ActionItem[]
    label?: string
}>(), {
    label: 'Mở menu thao tác',
})

const emit = defineEmits<{ select: [key: string] }>()

const handleClick = ({ key }: { key: string }) => emit('select', key)
</script>

<style scoped>
.admin-action-menu__trigger {
    width: 36px;
    height: 36px;
    color: var(--color-muted-foreground);
}
</style>
