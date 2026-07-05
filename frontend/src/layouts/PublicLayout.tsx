import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export const PublicLayout = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell public-layout">
      <header className="public-header">
        <div className="brand-lockup">
          <NavLink className="brand-mark" to="/">
            Noir & Blanc
          </NavLink>
          <span className="brand-subtitle">Boutique de prendas atemporales</span>
        </div>

        <nav className="public-nav" aria-label="Navegacion principal">
          <NavLink
            className={({ isActive }) =>
              `nav-pill${isActive ? ' is-active' : ''}`
            }
            to="/"
          >
            Catalogo
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-pill${isActive ? ' is-active' : ''}`
            }
            to={isAuthenticated ? '/admin/productos/crear' : '/login'}
          >
            {isAuthenticated ? 'Panel admin' : 'Iniciar sesion'}
          </NavLink>
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <span>Noir & Blanc selecciona siluetas sobrias para un guardarropa sereno.</span>
        <span>Catalogo publico y gestion privada sincronizados con tu API.</span>
      </footer>
    </div>
  )
}
