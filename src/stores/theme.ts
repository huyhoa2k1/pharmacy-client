import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'system' as ThemeMode,
    systemDark:
      typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(DARK_QUERY).matches : false,
  }),
  getters: {
    isDark: (state) => (state.mode === 'system' ? state.systemDark : state.mode === 'dark'),
  },
  actions: {
    setMode(mode: ThemeMode) {
      this.mode = mode
    },
    // follow OS theme changes while in system mode
    watchSystem() {
      if (typeof window === 'undefined' || !window.matchMedia) return
      const media = window.matchMedia(DARK_QUERY)
      this.systemDark = media.matches
      media.addEventListener('change', (e) => {
        this.systemDark = e.matches
      })
    },
  },
  persist: { pick: ['mode'] },
})
