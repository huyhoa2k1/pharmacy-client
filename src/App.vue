<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import enUS from 'ant-design-vue/es/locale/en_US'
import { pharmacyTheme, pharmacyDarkTheme } from '@/config/designSystem'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const { t, locale } = useI18n()
const localeStore = useLocaleStore()
const themeStore = useThemeStore()
const antdLocale = computed(() => (localeStore.locale === 'en' ? enUS : viVN))

// admin pages are light-only
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const effectiveDark = computed(() => themeStore.isDark && !isAdminRoute.value)
const antdTheme = computed(() => (effectiveDark.value ? pharmacyDarkTheme : pharmacyTheme))

watch(effectiveDark, (dark) => document.documentElement.classList.toggle('dark', dark), { immediate: true })

// keep document title in sync when the user switches language without navigating
watch(locale, () => {
  const titleKey = route.meta?.titleKey as string | undefined
  if (titleKey) document.title = t(titleKey)
})
</script>

<template>
  <a-config-provider :theme="antdTheme" :locale="antdLocale">
    <component :is="route.meta?.layout">
      <slot></slot>
    </component>
  </a-config-provider>
</template>