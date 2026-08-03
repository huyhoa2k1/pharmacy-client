export interface ILoginRequest {
  phone: string
  password: string
}

export interface ILoginResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: number
    username: string
    email: string
    phone: string
    role: string
  }
}

export interface IRegisterRequest {
  username?: string
  email: string
  phone: string
  password: string
}
