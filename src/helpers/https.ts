import axios from 'axios'
import router from '@/router'
import { message } from 'ant-design-vue'
import { getActivePinia } from 'pinia'
import { useUserStore } from '@/stores/user'

const IP = 'localhost'
const PORT = '8000'

// export const BASE_URL = 'https://egging-factsheet-singer.ngrok-free.dev/api'
export const BASE_URL = `http://${IP}:${PORT}/api`
export const SOCKET_URL = `http://${IP}:${PORT}/ws`

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
  },
})

const getCurrentUserStore = () => {
  const activePinia = getActivePinia()
  if (!activePinia) {
    return null
  }
  return useUserStore()
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers!['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    message.error('Request error: ' + error.message)
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data.message) {
      message.success(response.data.message)
    }
    return Promise.resolve(response)
  },
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }
      originalRequest._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      const userStore = getCurrentUserStore()
      if (!refreshToken) {
        userStore?.logout()
        router.push({ name: 'Login' })
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newAccessToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken

        localStorage.setItem('token', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + newAccessToken
        processQueue(null, newAccessToken)
        return axiosInstance(originalRequest)
      } catch (err) {
        processQueue(err, null)
        getCurrentUserStore()?.logout()
        message.error('Session expired. Please log in again.')
        router.push({ name: 'Login' })
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    switch (error.response?.status) {
      case 403:
        message.error('Forbidden! You do not have permission to access this resource.')
        break
      case 404:
        message.error('Not Found! The requested resource could not be found.')
        break
      case 500:
        message.error('Internal Server Error! Please try again later.')
        break
      default:
        message.error('Error: ' + (error.response?.data?.message || error.message))
    }
  },
)

export default axiosInstance
