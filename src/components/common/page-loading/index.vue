<template>
    <a-spin :spinning="loading" :tip="t('common.loading')" wrapper-class-name="page-loading">
        <slot />
    </a-spin>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
    loading: boolean
}>()

const { t } = useI18n()
</script>

<style>
.page-loading {
    min-height: 60vh;
}

/* Ẩn hoàn toàn nội dung khi đang tải thay vì làm mờ */
.page-loading .ant-spin-container.ant-spin-blur {
    opacity: 0;
    transition: none;
}

.page-loading .ant-spin-container::after {
    background: transparent;
}
</style>
