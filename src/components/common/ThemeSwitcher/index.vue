<template>
    <a-dropdown trigger="click" placement="bottomRight">
        <button type="button" class="theme-switcher" :aria-label="t('common.selectTheme')">
            <i :class="['pi', currentIcon]" aria-hidden="true"></i>
        </button>
        <template #overlay>
            <a-menu :selectedKeys="[themeStore.mode]" @click="handleSelect">
                <a-menu-item key="light"><i class="pi pi-sun mr-2"></i>{{ t('common.themeLight') }}</a-menu-item>
                <a-menu-item key="dark"><i class="pi pi-moon mr-2"></i>{{ t('common.themeDark') }}</a-menu-item>
                <a-menu-item key="system"><i class="pi pi-desktop mr-2"></i>{{ t('common.themeSystem') }}</a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore, type ThemeMode } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

const currentIcon = computed(() =>
    themeStore.mode === 'system' ? 'pi-desktop' : themeStore.mode === 'dark' ? 'pi-moon' : 'pi-sun',
)

const handleSelect = ({ key }: { key: string | number }) => {
    themeStore.setMode(key as ThemeMode)
}
</script>

<style scoped>
.theme-switcher {
    display: flex;
    align-items: center;
    padding: 0.4rem 0.6rem;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: inherit;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.theme-switcher:hover {
    background-color: var(--color-hover);
}
</style>
