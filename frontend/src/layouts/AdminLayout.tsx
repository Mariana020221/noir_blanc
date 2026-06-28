import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `sidebar-link${isActive ? ' is-active' : ''}`

export const AdminLayout = () => {
  const navigate = useNavigate()
  const { logout, usuario } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell admin-layout">
      <aside className="admin-sidebar">
        <div className="content-stack">
          <div className="sidebar-copy">
            <div className="brand-mark">Noir & Blanc</div>
            <div className="brand-subtitle">Back office de boutique</div>
          </div>

          <nav className="sidebar-nav" aria-label="Navegacion de administrador">
            <NavLink className={getLinkClassName} end to="/admin">
              <span>Dashboard</span>
              <span aria-hidden="true">01</span>
            </NavLink>
            <NavLink className={getLinkClassName} to="/admin/productos">
              <span>Productos</span>
              <span aria-hidden="true">02</span>
            </NavLink>
          </nav>

          <div className="sidebar-note">
            <strong>{usuario?.nombre ?? 'Administrador'}</strong>
            <p className="muted-text">
              Gestiona catalogo, visibilidad y altas de producto desde un solo
              panel.
            </p>
          </div>
        </div>

        <button className="button button--ghost" onClick={handleLogout} type="button">
          Cerrar sesion
        </button>
      </aside>

      <section className="admin-panel">
        <header className="admin-header">
          <div>
            <span className="eyebrow">Admin protegido</span>
            <h1 className="panel-title">Noir & Blanc Control Room</h1>
          </div>
          <div className="small-label">
            Sesion activa: {usuario?.email ?? 'administrador'}
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
