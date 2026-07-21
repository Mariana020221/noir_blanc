import api from '../api/api'
import type { UsuarioAuth } from '../auth/auth.service'

export interface CrearUsuarioPayload {
  nombre: string
  email: string
  password: string
}

export interface CambiarPasswordUsuarioPayload {
  password: string
}

export type UsuarioAdmin = UsuarioAuth

export const getUsuarios = async () => {
  const { data } = await api.get<UsuarioAdmin[]>('/usuarios')

  return data
}

export const createUsuario = async (payload: CrearUsuarioPayload) => {
  const { data } = await api.post<UsuarioAdmin>('/usuarios', payload)

  return data
}

export const updateUsuarioPassword = async (
  id: number,
  payload: CambiarPasswordUsuarioPayload,
) => {
  const { data } = await api.patch<UsuarioAdmin>(`/usuarios/${id}/password`, payload)

  return data
}
