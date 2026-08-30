<template>
    <div class="admin-pagination">
        <span v-if="showTotal" class="admin-pagination__total">{{ totalLabel }}</span>
        <a-pagination :current="current" :page-size="pageSize" :total="total" :show-size-changer="showSizeChanger"
            :show-less-items="true" @change="handleChange" @show-size-change="handleSizeChange" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
    current: number
    pageSize: number
    total: number
    showSizeChanger?: boolean
    showTotal?: boolean
}>(), {
    showSizeChanger: true,
    showTotal: true,
})

const emit = defineEmits<{
    change: [page: number, pageSize: number]
    'size-change': [current: number, size: number]
}>()

const totalLabel = computed(() => `${props.total.toLocaleString('vi-VN')} kết quả`)

const handleChange = (page: number, size: number) => {
    emit('change', page, size)
}

const handleSizeChange = (current: number, size: number) => {
    emit('size-change', current, size)
}
</script>

<style scoped>
.admin-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    width: 100%;
    color: var(--color-muted-foreground);
    font-size: 0.875rem;
}

.admin-pagination__total {
    white-space: nowrap;
}

@media (max-width: 640px) {
    .admin-pagination {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
