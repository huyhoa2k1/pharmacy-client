import axiosInstance from '@/helpers/https'
import axios from 'axios'
import type { ILoginRequest, ILoginResponse, IRegisterRequest } from '../models/auth'

export class AuthService {
  public static readonly login: (data: ILoginRequest) => Promise<ILoginResponse> = async (data) =>
    axios.post<ILoginResponse>('http://localhost:8000/api/auth/login', data).then((res) => res.data)

  public static readonly refreshToken: (refreshToken: string) => Promise<ILoginResponse> = async (
    refreshToken,
  ) =>
    axios
      .post<ILoginResponse>('http://localhost:8000/api/auth/refresh', { refreshToken })
      .then((res) => res.data)

  public static readonly register: (data: IRegisterRequest) => Promise<ILoginResponse> = async (
    data,
  ) =>
    axios
      .post<ILoginResponse>('http://localhost:8000/api/auth/register', data)
      .then((res) => res.data)
}
