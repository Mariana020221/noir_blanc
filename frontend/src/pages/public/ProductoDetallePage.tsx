import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../api/api'
import { getProductCategoryLabel } from '../../constants/productCategories'
import {
  formatPrecio,
  getProductoById,
  type Producto,
} from '../../services/productos.service'

interface ProductoColorVariant {
  key: string
  label: string
  colorHex: string
}

const normalizeColorKey = (value?: string | null) => value?.trim().toLowerCase() ?? ''

const buildVariantKey = (label?: string | null, colorHex?: string | null) =>
  `${normalizeColorKey(label)}|${(colorHex ?? '').trim().toLowerCase()}`

const getProductoCategorias = (producto: Producto) =>
  producto.categorias.length > 0
    ? producto.categorias
    : producto.categoria.trim()
      ? [producto.categoria]
      : []

const buildColorVariants = (producto: Producto | null): ProductoColorVariant[] => {
  if (!producto) {
    return []
  }

  const uniqueVariants = new Map<string, ProductoColorVariant>()
  const registerVariant = (label?: string | null, colorHex?: string | null) => {
    const normalizedHex = colorHex?.trim() || '#d2c8bc'
    const normalizedLabel = label?.trim() || 'Tono'
    const key = buildVariantKey(normalizedLabel, normalizedHex)

    if (!uniqueVariants.has(key)) {
      uniqueVariants.set(key, {
        key,
        label: normalizedLabel,
        colorHex: normalizedHex,
      })
    }
  }

  if (producto.imagenPrincipalColor || producto.imagenPrincipalColorHex) {
    registerVariant(producto.imagenPrincipalColor, producto.imagenPrincipalColorHex)
  }

  producto.imagenesPorColor.forEach((image) => {
    if (image.color || image.colorHex) {
      registerVariant(image.color, image.colorHex)
    }
  })

  return Array.from(uniqueVariants.values())
}

const buildGaleria = (
  producto: Producto | null,
  selectedVariantKey: string | null,
) => {
  if (!producto) {
    return []
  }

  const hasColorRelations =
    Boolean(producto.imagenPrincipalColor?.trim()) ||
    Boolean(producto.imagenPrincipalColorHex?.trim()) ||
    producto.imagenesPorColor.length > 0
  const matchesSelectedVariant = (
    label?: string | null,
    colorHex?: string | null,
  ) =>
    !selectedVariantKey ||
    buildVariantKey(label, colorHex) === selectedVariantKey

  const galleryImages: string[] = []

  if (
    producto.imagenPrincipal &&
    matchesSelectedVariant(
      producto.imagenPrincipalColor,
      producto.imagenPrincipalColorHex,
    )
  ) {
    galleryImages.push(producto.imagenPrincipal)
  }

  if (hasColorRelations) {
    galleryImages.push(
      ...producto.imagenesPorColor
        .filter((image) => matchesSelectedVariant(image.color, image.colorHex))
        .map((image) => image.imagen),
    )
  } else {
    galleryImages.push(...producto.imagenes)
  }

  return Array.from(new Set(galleryImages.filter(Boolean)))
}

export const ProductoDetallePage = () => {
  const { id } = useParams()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageHasError, setSelectedImageHasError] = useState(false)
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
          setProducto(response)
          setSelectedVariantKey(null)
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

  useEffect(() => {
    setSelectedImageHasError(false)
  }, [selectedImage])

  const galeria = useMemo(
    () => buildGaleria(producto, selectedVariantKey),
    [producto, selectedVariantKey],
  )
  const colorVariants = useMemo(() => buildColorVariants(producto), [producto])
  const selectedVariant = colorVariants.find(
    (variant) => variant.key === selectedVariantKey,
  )
  const categorias = producto ? getProductoCategorias(producto) : []

  useEffect(() => {
    if (galeria.length === 0) {
      setSelectedImage(null)
      return
    }

    setSelectedImage((current) =>
      current && galeria.includes(current) ? current : galeria[0],
    )
  }, [galeria])

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
    <div className="content-stack detail-page-shell">
      <Link className="back-link" to="/">
        Volver al catalogo
      </Link>

      <section className="detail-grid">
        <article className="detail-gallery-column">
          <div className="detail-media">
            {selectedImage && !selectedImageHasError ? (
              <img
                alt={producto.nombre}
                onError={() => setSelectedImageHasError(true)}
                src={selectedImage}
              />
            ) : (
              <div className="media-fallback">Noir & Blanc</div>
            )}
          </div>

          {colorVariants.length > 0 ? (
            <div className="detail-color-switcher">
              <button
                className={`filter-chip${selectedVariantKey === null ? ' is-active' : ''}`}
                onClick={() => setSelectedVariantKey(null)}
                type="button"
              >
                Todas las vistas
              </button>
              {colorVariants.map((variant) => (
                <button
                  className={`detail-swatch-button${
                    selectedVariantKey === variant.key ? ' is-active' : ''
                  }`}
                  key={variant.key}
                  onClick={() => setSelectedVariantKey(variant.key)}
                  type="button"
                >
                  <span
                    className="detail-swatch-dot"
                    style={{ backgroundColor: variant.colorHex }}
                  />
                  <span>{variant.label}</span>
                </button>
              ))}
            </div>
          ) : null}

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
          <div className="detail-heading-block">
            <span className="eyebrow">Detalle de producto</span>
            <h1 className="detail-name">{producto.nombre}</h1>
            <div className="detail-price">{formatPrecio(producto.precio)}</div>
          </div>

          <p className="lede">
            <span className="detail-id-copy">ID del producto #{producto.id}</span>
            {producto.descripcion}
          </p>

          <div className="detail-meta-row">
            {categorias.map((categoria) => (
              <span className="meta-chip" key={categoria}>
                {getProductCategoryLabel(categoria)}
              </span>
            ))}
            <span className="meta-chip">{producto.marca}</span>
            <span
              className={`status-chip ${
                producto.activo ? 'is-active' : 'is-inactive'
              }`}
            >
              {producto.activo ? 'Disponible' : 'No disponible'}
            </span>
            {selectedVariant ? (
              <span className="meta-chip">Vista {selectedVariant.label}</span>
            ) : null}
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
