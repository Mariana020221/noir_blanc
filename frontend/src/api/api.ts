import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const AUTH_TOKEN_STORAGE_KEY = 'noir-blanc.auth.token'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Ocurrio un error inesperado.',
): string => {
  return getApiErrorMessages(error, fallback).join(' ')
}

export const getApiErrorMessages = (
  error: unknown,
  fallback = 'Ocurrio un error inesperado.',
): string[] => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message

    if (Array.isArray(message)) {
      return message
        .map((item) => String(item).trim())
        .filter(Boolean)
    }

    if (typeof message === 'string') {
      return [message]
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return [error.message]
  }

  return [fallback]
}

export default api
