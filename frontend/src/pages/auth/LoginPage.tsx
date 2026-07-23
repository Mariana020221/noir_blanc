import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import { useAuth } from '../../auth/AuthContext'
import {
  getBootstrapStatus,
  registerFirstAdmin,
  registerUser,
} from '../../auth/auth.service'

type AuthMode = 'login' | 'register'

interface LoginPageProps {
  overlay?: boolean
}

export const LoginPage = ({ overlay = false }: LoginPageProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isSuperUser, login } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkingBootstrap, setCheckingBootstrap] = useState(true)
  const [canCreateFirstAdmin, setCanCreateFirstAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fromState = location.state as { from?: string } | null
  const adminRedirectTo = fromState?.from?.startsWith('/admin')
    ? fromState.from
    : '/admin'
  const closeOverlay = () => {
    navigate(
      {
        pathname: '/',
        search: location.search,
      },
      { replace: true },
    )
  }

  useEffect(() => {
    let active = true

    const loadBootstrapStatus = async () => {
      try {
        const response = await getBootstrapStatus()

        if (active) {
          setCanCreateFirstAdmin(response.canCreateFirstAdmin)
        }
      } catch {
        if (active) {
          setCanCreateFirstAdmin(false)
        }
      } finally {
        if (active) {
          setCheckingBootstrap(false)
        }
      }
    }

    void loadBootstrapStatus()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!overlay) {
      return
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [overlay])

  if (isAuthenticated) {
    return <Navigate replace to={isSuperUser ? '/admin' : '/'} />
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError(null)

      if (mode === 'register') {
        if (checkingBootstrap) {
          setError('Espera un momento mientras validamos el acceso inicial.')
          return
        }

        const payload = {
          nombre,
          email,
          password,
        }

        if (canCreateFirstAdmin) {
          await registerFirstAdmin(payload)
        } else {
          await registerUser(payload)
        }
      }

      const usuario = await login({ email, password })
      const redirectTo =
        usuario.rol === 'SUPER_ADMIN' ? adminRedirectTo : '/'

      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          mode === 'register'
            ? canCreateFirstAdmin
              ? 'No fue posible crear la cuenta inicial.'
              : 'No fue posible crear el acceso.'
            : 'No fue posible iniciar sesión con esas credenciales.',
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const registerEyebrow = canCreateFirstAdmin
    ? 'Registro inicial'
    : 'Nuevo acceso'
  const registerTitle = canCreateFirstAdmin
    ? 'Crear cuenta inicial'
    : 'Crear acceso'
  const registerDescription = canCreateFirstAdmin
    ? 'Completa estos datos para habilitar la primera cuenta del sistema.'
    : 'Registra aquí un nuevo acceso. Las cuentas posteriores no reciben administración total.'
  const loginDescription =
    'Escribe tu correo y tu contraseña para continuar.'
  const content = (
    <section
      aria-modal={overlay ? true : undefined}
      aria-labelledby="login-modal-title"
      className={`login-modal-card${overlay ? ' login-modal-card--overlay' : ''}`}
      role={overlay ? 'dialog' : undefined}
    >
      <div className="login-modal-header">
        <div>
          <span className="eyebrow">Acceso</span>
          <h1 className="panel-title" id="login-modal-title">
            Noir&Blanc
          </h1>
          <p className="muted-text">
            Entra con tu cuenta o crea un acceso si todavía no lo tienes.
          </p>
        </div>

        {overlay ? (
          <button
            className="button button--ghost"
            onClick={closeOverlay}
            type="button"
          >
            Cerrar
          </button>
        ) : null}
      </div>

      <div className="login-modal-body">
        <section className="login-card login-card--modal">
          <div>
            <span className="eyebrow">
              {mode === 'register' ? registerEyebrow : 'Ingreso'}
            </span>
            <h2 className="panel-title">
              {mode === 'register' ? registerTitle : 'Iniciar sesión'}
            </h2>
            <p className="muted-text">
              {mode === 'register' ? registerDescription : loginDescription}
            </p>
          </div>

          {checkingBootstrap ? (
            <div className="muted-text">
              Verificando disponibilidad de registro...
            </div>
          ) : null}

          <div className="mode-switch" role="tablist" aria-label="Modo de acceso">
            <button
              className={`mode-button${mode === 'login' ? ' is-active' : ''}`}
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              type="button"
            >
              Iniciar sesión
            </button>
            <button
              className={`mode-button${mode === 'register' ? ' is-active' : ''}`}
              onClick={() => {
                setMode('register')
                setError(null)
              }}
              type="button"
            >
              Crear acceso
            </button>
          </div>

          {error ? <div className="alert alert--error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className="field-group">
                <span className="field-label">Nombre</span>
                <input
                  autoComplete="name"
                  className="text-input"
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Nombre completo"
                  required
                  type="text"
                  value={nombre}
                />
              </label>
            ) : null}

            <label className="field-group">
              <span className="field-label">Correo electrónico</span>
              <input
                autoComplete="email"
                className="text-input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Contraseña</span>
              <input
                autoComplete="current-password"
                className="text-input"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
                required
                type="password"
                value={password}
              />
            </label>

            <button
              className="button button--primary"
              disabled={submitting || checkingBootstrap}
              type="submit"
            >
              {submitting
                ? mode === 'register'
                  ? 'Creando acceso...'
                  : 'Ingresando...'
                : mode === 'register'
                  ? 'Crear acceso y continuar'
                  : 'Continuar'}
            </button>
          </form>
        </section>
      </div>
    </section>
  )

  if (overlay) {
    return createPortal(
      <div className="login-overlay" onClick={closeOverlay}>
        <div
          className="login-overlay-shell"
          onClick={(event) => event.stopPropagation()}
        >
          {content}
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <main className="login-page">
      <div className="login-shell">{content}</div>
    </main>
  )
}
