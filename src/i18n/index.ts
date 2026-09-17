import { createI18n } from 'vue-i18n'
import vi from './locales/vi'
import en from './locales/en'

export const SUPPORTED_LOCALES = ['vi', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export function detectBrowserLocale(): AppLocale {
  const lang = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() : ''
  return lang?.startsWith('en') ? 'en' : 'vi'
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectBrowserLocale(),
  fallbackLocale: 'vi',
  messages: { vi, en },
})

export default i18n
