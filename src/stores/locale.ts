import { defineStore } from 'pinia'
import { i18n, detectBrowserLocale, type AppLocale } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    locale: detectBrowserLocale() as AppLocale,
  }),
  actions: {
    setLocale(locale: AppLocale) {
      this.locale = locale
      i18n.global.locale.value = locale
    },
    // re-apply the persisted locale to the i18n instance on app start
    applyLocale() {
      i18n.global.locale.value = this.locale
    },
  },
  persist: true,
})
