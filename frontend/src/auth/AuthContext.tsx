import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  clearAuthSession,
  loginRequest,
  persistAuthSession,
  readStoredToken,
  readStoredUser,
  type LoginDto,
  type UsuarioAuth,
} from './auth.service'

interface AuthContextValue {
  usuario: UsuarioAuth | null
  token: string | null
  isAuthenticated: boolean
  isSuperUser: boolean
  login: (credentials: LoginDto) => Promise<UsuarioAuth>
  logout: (redirectTo?: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(() => readStoredUser())
  const [token, setToken] = useState<string | null>(() => readStoredToken())

  const login = async (credentials: LoginDto) => {
    const response = await loginRequest(credentials)

    persistAuthSession(response)
    setUsuario(response.usuario)
    setToken(response.accessToken)

    return response.usuario
  }

  const logout = (redirectTo?: string) => {
    clearAuthSession()

    if (redirectTo && typeof window !== 'undefined') {
      window.location.replace(redirectTo)
      return
    }

    setUsuario(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: Boolean(token),
        isSuperUser: usuario?.rol === 'SUPER_ADMIN',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.')
  }

  return context
}
