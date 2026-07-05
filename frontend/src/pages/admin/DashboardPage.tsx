import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import {
  formatPrecio,
  getProductos,
  type Producto,
} from '../../services/productos.service'

export const DashboardPage = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        setLoading(true)
        const response = await getProductos()

        if (active) {
          setProductos(response)
          setError(null)
        }
      } catch (requestError) {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No fue posible cargar el dashboard en este momento.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [])

  const activos = productos.filter((producto) => producto.activo)
  const productosRecientes = [...productos]
    .sort((left, right) => right.id - left.id)
    .slice(0, 4)

  return (
    <div className="content-stack">
      <section className="section-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Panorama rapido del catalogo y la visibilidad actual de la tienda.</p>
        </div>
        <Link className="button button--secondary" to="/admin/productos/crear">
          Crear productos
        </Link>
      </section>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="stats-grid">
        <article className="stat-card">
          <span className="small-label">Total</span>
          <strong className="stat-value">{productos.length}</strong>
          <p className="muted-text">Productos registrados en la API.</p>
        </article>
        <article className="stat-card">
          <span className="small-label">Activos</span>
          <strong className="stat-value">{activos.length}</strong>
          <p className="muted-text">Visibles para el catalogo publico.</p>
        </article>
        <article className="stat-card">
          <span className="small-label">Categorias</span>
          <strong className="stat-value">
            {new Set(productos.map((producto) => producto.categoria)).size}
          </strong>
          <p className="muted-text">Familias de producto activas.</p>
        </article>
        <article className="stat-card">
          <span className="small-label">Marcas</span>
          <strong className="stat-value">
            {new Set(productos.map((producto) => producto.marca)).size}
          </strong>
          <p className="muted-text">Sellos disponibles en vitrina.</p>
        </article>
      </div>

      <section className="dashboard-grid">
        <article className="admin-card">
          <div className="section-heading">
            <h2>Resumen</h2>
            <span className="small-label">
              {loading ? 'Actualizando...' : 'Sincronizado'}
            </span>
          </div>
          <p className="lede">
            Usa este tablero para detectar rapidamente productos visibles, marcas
            dominantes y las ultimas altas del catalogo.
          </p>

          <div className="hero-meta">
            <div className="hero-stat">
              <strong>
                {activos.reduce(
                  (accumulator, producto) => accumulator + producto.existencia,
                  0,
                )}
              </strong>
              <span>Piezas en stock</span>
            </div>
            <div className="hero-stat">
              <strong>
                {productos.length > 0
                  ? formatPrecio(
                      productos.reduce(
                        (accumulator, producto) => accumulator + producto.precio,
                        0,
                      ) / productos.length,
                    )
                  : formatPrecio(0)}
              </strong>
              <span>Precio promedio</span>
            </div>
            <div className="hero-stat">
              <strong>{productos.filter((producto) => !producto.activo).length}</strong>
              <span>Ocultos</span>
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="section-heading">
            <h2>Ultimos productos</h2>
            <span className="small-label">Ordenados por alta</span>
          </div>

          {productosRecientes.length === 0 ? (
            <div className="empty-state">
              Todavia no hay productos registrados para mostrar.
            </div>
          ) : (
            <div className="product-list">
              {productosRecientes.map((producto) => (
                <div className="admin-product-card" key={producto.id}>
                  <div className="product-media">
                    {producto.imagenPrincipal ? (
                      <img alt={producto.nombre} src={producto.imagenPrincipal} />
                    ) : (
                      <div className="media-fallback">Noir & Blanc</div>
                    )}
                  </div>
                  <div>
                    <p className="small-label">{producto.categoria}</p>
                    <h3 className="catalog-name">{producto.nombre}</h3>
                    <div className="admin-product-meta">
                      <span className="meta-chip">{producto.marca}</span>
                      <span className="meta-chip">{formatPrecio(producto.precio)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}
