import { defineStore } from 'pinia'
import { AuthService } from '@/api/services/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: 0,
    username: '',
    email: '',
    phone: '',
    role: '',
    isLogin: false,
  }),
  actions: {
    setUser(user: {
      id: number
      username: string
      email?: string | null
      phone: string
      role: string
    }) {
      this.userId = user.id
      this.username = user.username
      this.email = user.email ?? ''
      this.phone = user.phone
      ;(this.role = user.role), (this.isLogin = true)
    },
    restoreSession() {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('pharmacy_user')

      if (!token || !savedUser) {
        this.logout()
        return
      }

      try {
        const parsedUser = JSON.parse(savedUser)
        const normalizedUser = {
          id: parsedUser.id ?? parsedUser.userId ?? 0,
          username: parsedUser.username ?? parsedUser.userName ?? parsedUser.name ?? '',
          email: parsedUser.email ?? '',
          phone: parsedUser.phone ?? parsedUser.mobile ?? '',
          role: parsedUser.role ?? '',
        }

        this.setUser(normalizedUser)
      } catch {
        this.logout()
      }
    },
    logout() {
      this.userId = 0
      this.username = ''
      this.email = ''
      this.phone = ''
      this.role = ''
      this.isLogin = false

      localStorage.removeItem('token')
      // Legacy key from when the refresh token was kept in localStorage.
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('pharmacy_user')
    },
    async signOut() {
      const token = localStorage.getItem('token')
      await AuthService.logout()
      if (localStorage.getItem('token') === token) {
        this.logout()
      }
    },
  },
})
