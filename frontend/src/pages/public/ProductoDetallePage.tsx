import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import {
  formatPrecio,
  getProductoById,
  type Producto,
} from '../../services/productos.service'

const buildGaleria = (producto: Producto | null) => {
  if (!producto) {
    return []
  }

  return [producto.imagenPrincipal, ...producto.imagenes].filter(
    (image): image is string => Boolean(image),
  )
}

export const ProductoDetallePage = () => {
  const { id } = useParams()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const productoId = Number(id)

    if (Number.isNaN(productoId)) {
      setError('El producto solicitado no es valido.')
      setLoading(false)
      return
    }

    const loadProducto = async () => {
      try {
        setLoading(true)
        const response = await getProductoById(productoId)

        if (active) {
          const galeria = buildGaleria(response)
          setProducto(response)
          setSelectedImage(galeria[0] ?? null)
          setError(null)
        }
      } catch (requestError) {
        if (active) {
          setError(
            getApiErrorMessage(
              requestError,
              'No fue posible cargar el detalle del producto.',
            ),
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProducto()

    return () => {
      active = false
    }
  }, [id])

  const galeria = buildGaleria(producto)

  if (loading) {
    return (
      <div className="content-stack">
        <div className="skeleton-card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-stack">
        <Link className="back-link" to="/">
          Volver al catalogo
        </Link>
        <div className="alert alert--error">{error}</div>
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="content-stack">
        <Link className="back-link" to="/">
          Volver al catalogo
        </Link>
        <div className="empty-state">No encontramos ese producto.</div>
      </div>
    )
  }

  return (
    <div className="content-stack">
      <Link className="back-link" to="/">
        Volver al catalogo
      </Link>

      <section className="detail-grid">
        <article>
          <div className="detail-media">
            {selectedImage ? (
              <img alt={producto.nombre} src={selectedImage} />
            ) : (
              <div className="media-fallback">Noir & Blanc</div>
            )}
          </div>

          {galeria.length > 1 ? (
            <div className="detail-thumbs">
              {galeria.map((image) => (
                <button
                  className={`thumb-button${
                    image === selectedImage ? ' is-active' : ''
                  }`}
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  <img alt={`Vista de ${producto.nombre}`} src={image} />
                </button>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="detail-panel detail-stack">
          <div>
            <span className="eyebrow">Detalle de producto</span>
            <h1 className="detail-name">{producto.nombre}</h1>
            <div className="detail-price">{formatPrecio(producto.precio)}</div>
          </div>

          <p className="lede">{producto.descripcion}</p>

          <div className="detail-meta-row">
            <span className="meta-chip">{producto.categoria}</span>
            <span className="meta-chip">{producto.marca}</span>
            <span
              className={`status-chip ${
                producto.activo ? 'is-active' : 'is-inactive'
              }`}
            >
              {producto.activo ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <div className="surface-card">
            <div className="section-heading">
              <h2>Ficha</h2>
              <span className="small-label">{producto.existencia} piezas</span>
            </div>

            <div className="detail-meta-row">
              {producto.tallas.length > 0 ? (
                producto.tallas.map((talla) => (
                  <span className="tag-chip" key={talla}>
                    Talla {talla}
                  </span>
                ))
              ) : (
                <span className="muted-text">Sin tallas registradas.</span>
              )}
            </div>

            <div className="detail-meta-row">
              {producto.colores.length > 0 ? (
                producto.colores.map((color) => (
                  <span className="tag-chip" key={color}>
                    {color}
                  </span>
                ))
              ) : (
                <span className="muted-text">Sin colores registrados.</span>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
