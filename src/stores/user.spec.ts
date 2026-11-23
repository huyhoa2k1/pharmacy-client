import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { AuthService } from '@/api/services/auth'
import { useUserStore } from './user'

vi.mock('@/api/services/auth', () => ({ AuthService: { logout: vi.fn() } }))

describe('signOut', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.resetAllMocks()
    localStorage.setItem('token', 'access')
    localStorage.setItem('refreshToken', 'legacy-refresh')
    localStorage.setItem('pharmacy_user', '{}')
  })

  it('clears local state only after the server revokes the session', async () => {
    vi.mocked(AuthService.logout).mockResolvedValue()
    await useUserStore().signOut()
    expect(AuthService.logout).toHaveBeenCalledOnce()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('pharmacy_user')).toBeNull()
  })

  it('keeps the session when revocation fails', async () => {
    vi.mocked(AuthService.logout).mockRejectedValue(new Error('offline'))
    await expect(useUserStore().signOut()).rejects.toThrow('offline')
    expect(localStorage.getItem('token')).toBe('access')
  })

  it('does not clear a newer login while logout is in flight', async () => {
    let finish: () => void = () => {}
    vi.mocked(AuthService.logout).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = () => resolve()
        }),
    )
    const signingOut = useUserStore().signOut()
    localStorage.setItem('token', 'new-access')
    finish()
    await signingOut
    expect(localStorage.getItem('token')).toBe('new-access')
  })
})
