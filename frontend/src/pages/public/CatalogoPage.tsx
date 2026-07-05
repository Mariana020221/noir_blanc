import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import {
  formatPrecio,
  getProductos,
  type Producto,
} from '../../services/productos.service'

const ProductMedia = ({
  src,
  alt,
}: {
  src: string | null
  alt: string
}) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div className="product-media">
      {src && !hasError ? (
        <img alt={alt} loading="lazy" onError={() => setHasError(true)} src={src} />
      ) : (
        <div className="media-fallback">Noir & Blanc</div>
      )}
    </div>
  )
}

export const CatalogoPage = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadProductos = async () => {
      try {
        setLoading(true)
        const response = await getProductos()

        if (active) {
          setProductos(response.filter((producto) => producto.activo))
          setError(null)
        }
      } catch (requestError) {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No fue posible cargar el catalogo por ahora.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProductos()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="content-stack">
      <section className="hero-banner">
        <article className="hero-copy">
          <span className="eyebrow">Coleccion curada</span>
          <h1 className="display-title">Moda serena para una presencia impecable.</h1>
          <p className="lede">
            Un catalogo limpio, sobrio y contemporaneo para presentar prendas,
            texturas y siluetas con enfoque editorial. Todo el flujo conecta
            directamente con tu API de NestJS.
          </p>

          <div className="hero-meta">
            <div className="hero-stat">
              <strong>{productos.length}</strong>
              <span>Piezas visibles</span>
            </div>
            <div className="hero-stat">
              <strong>
                {new Set(productos.map((producto) => producto.categoria)).size}
              </strong>
              <span>Categorias</span>
            </div>
            <div className="hero-stat">
              <strong>{new Set(productos.map((producto) => producto.marca)).size}</strong>
              <span>Marcas</span>
            </div>
          </div>
        </article>

        <aside className="hero-aside">
          <div>
            <span className="eyebrow">Atmosfera boutique</span>
            <p className="quote">
              "Menos ruido, mejor seleccion. El producto respira y la marca se
              percibe premium."
            </p>
          </div>
          <div className="quote-source">Noir & Blanc Studio Notes</div>
        </aside>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h2>Catalogo publico</h2>
            <p>
              Explora el inventario disponible. Los detalles completos se abren en
              una ficha individual.
            </p>
          </div>
          <span className="small-label">Sin checkout, solo exhibicion</span>
        </div>

        {error ? <div className="alert alert--error">{error}</div> : null}

        {loading ? (
          <div className="loading-grid" aria-label="Cargando productos">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton-card" key={index} />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="empty-state">
            Aun no hay productos activos publicados en el catalogo.
          </div>
        ) : (
          <div className="catalog-grid">
            {productos.map((producto) => (
              <Link
                className="catalog-card"
                key={producto.id}
                to={`/producto/${producto.id}`}
              >
                <ProductMedia alt={producto.nombre} src={producto.imagenPrincipal} />

                <div className="catalog-body">
                  <p className="small-label">{producto.categoria}</p>
                  <h3 className="catalog-name">{producto.nombre}</h3>
                  <p className="catalog-description">{producto.descripcion}</p>

                  <div className="catalog-meta-row">
                    <span className="meta-chip">{producto.marca}</span>
                    <span className="meta-chip">
                      {producto.existencia} disponibles
                    </span>
                  </div>

                  <div className="catalog-footer">
                    <div className="product-price">{formatPrecio(producto.precio)}</div>
                    <span className="small-label">Ver detalle</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
