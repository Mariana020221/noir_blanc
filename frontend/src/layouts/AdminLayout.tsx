import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `sidebar-link${isActive ? ' is-active' : ''}`

export const AdminLayout = () => {
  const { isSuperUser, logout, usuario } = useAuth()

  const handleLogout = () => {
    logout('/')
  }

  return (
    <div className="app-shell app-shell--admin admin-layout">
      <aside className="admin-sidebar">
        <div className="content-stack">
          <div className="sidebar-copy">
            <div className="brand-mark">Noir&Blanc</div>
            <div className="brand-subtitle">Back office de boutique</div>
          </div>

          <nav className="sidebar-nav" aria-label="Navegacion de administrador">
            <NavLink className={getLinkClassName} end to="/admin">
              <span>Dashboard</span>
              <span aria-hidden="true">01</span>
            </NavLink>
            {isSuperUser ? (
              <>
                <NavLink className={getLinkClassName} to="/admin/usuarios">
                  <span>Usuarios</span>
                  <span aria-hidden="true">02</span>
                </NavLink>
                <NavLink className={getLinkClassName} to="/admin/productos/crear">
                  <span>Crear producto</span>
                  <span aria-hidden="true">03</span>
                </NavLink>
                <NavLink className={getLinkClassName} to="/admin/productos/editar">
                  <span>Editar productos</span>
                  <span aria-hidden="true">04</span>
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="sidebar-note">
            <strong>{usuario?.nombre ?? 'Administrador'}</strong>
            <p className="muted-text">
              {isSuperUser
                ? 'El superusuario controla las cuentas del equipo y el resto del catálogo desde modulos separados.'
                : 'Tu cuenta tiene acceso limitado. Solo el primer acceso puede administrar usuarios y gestionar productos.'}
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
            <h1 className="panel-title">Noir&Blanc Control Room</h1>
          </div>
          <div className="admin-header-actions">
            <NavLink className="button button--ghost" to="/">
              Catalogo
            </NavLink>
            <div className="small-label">
              Sesion activa: {usuario?.email ?? 'administrador'} |{' '}
              {usuario?.rol === 'SUPER_ADMIN' ? 'Superusuario' : 'Usuario del panel'}
            </div>
          </div>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </section>
    </div>
  )
}
