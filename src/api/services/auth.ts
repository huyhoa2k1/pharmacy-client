import axiosInstance from '@/helpers/https'
import type { ILoginRequest, ILoginResponse } from '../models/auth'

export class AuthService {
  public static readonly login: (data: ILoginRequest) => Promise<ILoginResponse> = async (data) =>
    axiosInstance.post<ILoginResponse>('/auth/login', data).then((res) => res.data)

  public static readonly refreshToken: (refreshToken: string) => Promise<ILoginResponse> = async (
    refreshToken,
  ) => axiosInstance.post<ILoginResponse>('/auth/refresh', { refreshToken }).then((res) => res.data)
}
