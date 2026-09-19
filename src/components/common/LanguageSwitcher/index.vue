<template>
    <a-dropdown trigger="click" placement="bottomRight">
        <button type="button" class="language-switcher" :aria-label="t('common.selectLanguage')">
            <i class="pi pi-globe" aria-hidden="true"></i>
            <span class="language-switcher__code">{{ localeStore.locale.toUpperCase() }}</span>
        </button>
        <template #overlay>
            <a-menu @click="handleSelect">
                <a-menu-item key="vi">{{ t('common.vietnamese') }}</a-menu-item>
                <a-menu-item key="en">{{ t('common.english') }}</a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'
import type { AppLocale } from '@/i18n'

const { t } = useI18n()
const localeStore = useLocaleStore()

const handleSelect = ({ key }: { key: AppLocale }) => {
    localeStore.setLocale(key)
}
</script>

<style scoped>
.language-switcher {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.6rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.language-switcher:hover {
    background-color: rgba(0, 0, 0, 0.05);
}
</style>
