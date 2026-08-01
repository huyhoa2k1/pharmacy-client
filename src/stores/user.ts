import { defineStore } from 'pinia'

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
    setUser(user: { id: number; username: string; email: string; phone: string; role: string }) {
      this.userId = user.id
      this.username = user.username
      this.email = user.email
      this.phone = user.phone
      ;(this.role = user.role), (this.isLogin = true)
    },
    restoreSession() {
      const token = localStorage.getItem('token')
      const refreshToken = localStorage.getItem('refreshToken')
      const savedUser = localStorage.getItem('pharmacy_user')

      if (!token || !refreshToken || !savedUser) {
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
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('pharmacy_user')
    },
  },
})
