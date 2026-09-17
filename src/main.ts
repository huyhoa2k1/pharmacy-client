import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import Antd from 'ant-design-vue'
import PrimeVue from 'primevue/config'
import CKEditor from '@ckeditor/ckeditor5-vue'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useUserStore } from './stores/user'
import { useLocaleStore } from './stores/locale'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

const userStore = useUserStore()
userStore.restoreSession()

// sync the i18n instance with the persisted locale (may differ from browser default)
const localeStore = useLocaleStore()
localeStore.applyLocale()

app.use(router)
app.use(i18n)
app.use(Antd)
app.use(CKEditor)
app.use(PrimeVue)

app.mount('#app')
