import { jwtDecode } from 'jwt-decode'

export async function handlePermissions(to: any, from: any, next: any) {
  const token = localStorage.getItem('token')
  let userRole = null

  if (token) {
    try {
      const decoded: any = jwtDecode(token)
      userRole = decoded?.role
    } catch (error) {
      console.error('Invalid token:', error)
    }
  }

  if (to.meta.roles && to.meta.roles.length > 0) {
    if (!userRole || !to.meta.roles.includes(userRole)) {
      return next('/login')
    }
  }

  next()
}
