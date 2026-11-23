import axios from 'axios'
import type { ILoginRequest, ILoginResponse, IRegisterRequest } from '../models/auth'

// The refresh token lives in an HttpOnly cookie, so these requests must send credentials.
const authClient = axios.create({
  baseURL: 'http://localhost:8000/api/auth',
  withCredentials: true,
  timeout: 30000,
})

const csrfHeaders = async () => {
  const { data } = await authClient.get<{ headerName: string; token: string }>('/csrf')
  return { [data.headerName]: data.token }
}

export class AuthService {
  public static readonly login: (data: ILoginRequest) => Promise<ILoginResponse> = async (data) =>
    authClient.post<ILoginResponse>('/login', data).then((res) => res.data)

  public static readonly refresh: () => Promise<{ accessToken: string }> = async () =>
    authClient
      .post<{ accessToken: string }>('/refresh', null, { headers: await csrfHeaders() })
      .then((res) => res.data)

  public static readonly logout: () => Promise<void> = async () => {
    await authClient.post('/logout', null, { headers: await csrfHeaders() })
  }

  public static readonly register: (data: IRegisterRequest) => Promise<ILoginResponse> = async (
    data,
  ) => authClient.post<ILoginResponse>('/register', data).then((res) => res.data)
}
