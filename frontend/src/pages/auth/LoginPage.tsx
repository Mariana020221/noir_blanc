import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import { useAuth } from '../../auth/AuthContext'
import {
  getBootstrapStatus,
  registerFirstAdmin,
} from '../../auth/auth.service'

type AuthMode = 'login' | 'register'

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [checkingBootstrap, setCheckingBootstrap] = useState(true)
  const [canCreateFirstAdmin, setCanCreateFirstAdmin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate replace to="/admin/productos" />
  }

  const fromState = location.state as { from?: string } | null
  const redirectTo = fromState?.from?.startsWith('/admin')
    ? fromState.from
    : '/admin/productos'

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError(null)

      if (mode === 'register') {
        await registerFirstAdmin({
          nombre,
          email,
          password,
        })
      }

      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          mode === 'register'
            ? 'No fue posible crear tu usuario inicial.'
            : 'No fue posible iniciar sesion con esas credenciales.',
        ),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const showRegisterOption = canCreateFirstAdmin && !checkingBootstrap

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="editorial-panel">
          <div className="content-stack">
            <span className="eyebrow">Acceso privado</span>
            <h1 className="display-title">Administra el escaparate con precision serena.</h1>
            <p className="lede">
              El panel privado de Noir & Blanc concentra altas, edicion y control
              visual del catalogo desde una experiencia silenciosa y refinada.
            </p>
          </div>

          <div className="editorial-grid">
            <article className="editorial-card">
              <span className="small-label">Proteccion</span>
              <p className="quote">JWT para resguardar cada cambio operativo.</p>
            </article>
            <article className="editorial-card">
              <span className="small-label">Gestion</span>
              <p className="quote">Productos y visibilidad en una sola capa.</p>
            </article>
          </div>

          <div className="quote-source">Panel administrativo de boutique</div>
        </section>

        <section className="login-card">
          <div>
            <span className="eyebrow">
              {mode === 'register' ? 'Primer acceso' : 'Sign in'}
            </span>
            <h2 className="panel-title">
              {mode === 'register' ? 'Crear tu usuario' : 'Iniciar sesion'}
            </h2>
            <p className="muted-text">
              {mode === 'register'
                ? 'Si aun no existe administrador, crea aqui el primer usuario y entrara al panel de productos.'
                : 'Usa tu correo de administrador para acceder al modulo interno.'}
            </p>
          </div>

          {checkingBootstrap ? (
            <div className="muted-text">Verificando si el sistema necesita su primer administrador...</div>
          ) : null}

          {showRegisterOption ? (
            <div className="mode-switch" role="tablist" aria-label="Modo de acceso">
              <button
                className={`mode-button${mode === 'login' ? ' is-active' : ''}`}
                onClick={() => {
                  setMode('login')
                  setError(null)
                }}
                type="button"
              >
                Iniciar sesion
              </button>
              <button
                className={`mode-button${mode === 'register' ? ' is-active' : ''}`}
                onClick={() => {
                  setMode('register')
                  setError(null)
                }}
                type="button"
              >
                Crear tu usuario
              </button>
            </div>
          ) : null}

          {error ? <div className="alert alert--error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <label className="field-group">
                <span className="field-label">Nombre</span>
                <input
                  autoComplete="name"
                  className="text-input"
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Nombre del administrador"
                  required
                  type="text"
                  value={nombre}
                />
              </label>
            ) : null}

            <label className="field-group">
              <span className="field-label">Email</span>
              <input
                autoComplete="email"
                className="text-input"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@noirblanc.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className="field-group">
              <span className="field-label">Password</span>
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
              disabled={submitting}
              type="submit"
            >
              {submitting
                ? mode === 'register'
                  ? 'Creando acceso...'
                  : 'Ingresando...'
                : mode === 'register'
                  ? 'Crear usuario y entrar'
                  : 'Iniciar sesion'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
