import api, { AUTH_TOKEN_STORAGE_KEY } from '../api/api'

export const AUTH_USER_STORAGE_KEY = 'noir-blanc.auth.user'

export interface UsuarioAuth {
  id: number
  nombre: string
  email: string
  rol: 'SUPER_ADMIN' | 'ADMIN'
  activo: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface LoginDto {
  email: string
  password: string
}

export interface CrearUsuarioDto {
  nombre: string
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: string
  usuario: UsuarioAuth
}

export interface BootstrapStatusResponse {
  canCreateFirstAdmin: boolean
}

const isBrowser = () => typeof window !== 'undefined'

const readJwtPayload = (
  token: string,
): { exp?: number; rol?: UsuarioAuth['rol'] } | null => {
  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return null
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = window.atob(normalizedPayload)

    return JSON.parse(decodedPayload) as { exp?: number; rol?: UsuarioAuth['rol'] }
  } catch {
    return null
  }
}

const isTokenExpired = (token: string): boolean => {
  const payload = readJwtPayload(token)

  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

export const loginRequest = async (credentials: LoginDto) => {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials)

  return data
}

export const getBootstrapStatus = async () => {
  const { data } = await api.get<BootstrapStatusResponse>(
    '/usuarios/bootstrap-status',
  )

  return data
}

export const registerFirstAdmin = async (payload: CrearUsuarioDto) => {
  const { data } = await api.post<UsuarioAuth>('/usuarios/bootstrap', payload)

  return data
}

export const registerUser = async (payload: CrearUsuarioDto) => {
  const { data } = await api.post<UsuarioAuth>('/usuarios/register', payload)

  return data
}

export const persistAuthSession = (response: LoginResponse) => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken)
  window.localStorage.setItem(
    AUTH_USER_STORAGE_KEY,
    JSON.stringify(response.usuario),
  )
}

export const clearAuthSession = () => {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
}

export const readStoredToken = (): string | null => {
  if (!isBrowser()) {
    return null
  }

  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (!token) {
    return null
  }

  if (isTokenExpired(token)) {
    clearAuthSession()
    return null
  }

  return token
}

export const readStoredUser = (): UsuarioAuth | null => {
  if (!isBrowser()) {
    return null
  }

  if (!readStoredToken()) {
    return null
  }

  const value = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)

  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as UsuarioAuth
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    return null
  }
}
