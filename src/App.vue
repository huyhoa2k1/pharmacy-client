<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import viVN from 'ant-design-vue/es/locale/vi_VN'
import enUS from 'ant-design-vue/es/locale/en_US'
import { pharmacyTheme } from '@/config/designSystem'
import { useLocaleStore } from '@/stores/locale'

const route = useRoute()
const { t, locale } = useI18n()
const localeStore = useLocaleStore()
const antdLocale = computed(() => (localeStore.locale === 'en' ? enUS : viVN))

// keep document title in sync when the user switches language without navigating
watch(locale, () => {
  const titleKey = route.meta?.titleKey as string | undefined
  if (titleKey) document.title = t(titleKey)
})
</script>

<template>
  <a-config-provider :theme="pharmacyTheme" :locale="antdLocale">
    <component :is="route.meta?.layout">
      <slot></slot>
    </component>
  </a-config-provider>
</template>