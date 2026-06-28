import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../api/api'
import {
  createProducto,
  deleteProducto,
  formatPrecio,
  getProductos,
  updateProducto,
  type Producto,
  type ProductoPayload,
} from '../../services/productos.service'

interface ProductoFormState {
  nombre: string
  descripcion: string
  precio: string
  existencia: string
  categoria: string
  marca: string
  tallas: string
  colores: string
  imagenPrincipal: string
  imagenes: string
  activo: boolean
}

const createEmptyFormState = (): ProductoFormState => ({
  nombre: '',
  descripcion: '',
  precio: '',
  existencia: '',
  categoria: '',
  marca: '',
  tallas: '',
  colores: '',
  imagenPrincipal: '',
  imagenes: '',
  activo: true,
})

const parseList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)

const mapProductoToForm = (producto: Producto): ProductoFormState => ({
  nombre: producto.nombre,
  descripcion: producto.descripcion,
  precio: String(producto.precio),
  existencia: String(producto.existencia),
  categoria: producto.categoria,
  marca: producto.marca,
  tallas: producto.tallas.join(', '),
  colores: producto.colores.join(', '),
  imagenPrincipal: producto.imagenPrincipal ?? '',
  imagenes: producto.imagenes.join('\n'),
  activo: producto.activo,
})

const buildPayload = (form: ProductoFormState): ProductoPayload => ({
  nombre: form.nombre.trim(),
  descripcion: form.descripcion.trim(),
  precio: Number(form.precio),
  existencia: Number(form.existencia),
  categoria: form.categoria.trim(),
  marca: form.marca.trim(),
  tallas: parseList(form.tallas),
  colores: parseList(form.colores),
  imagenPrincipal: form.imagenPrincipal.trim() || null,
  imagenes: parseList(form.imagenes),
  activo: form.activo,
})

export const ProductosAdminPage = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [form, setForm] = useState<ProductoFormState>(createEmptyFormState)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadProductos = async () => {
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
              'No fue posible cargar la administracion de productos.',
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

  const resetForm = () => {
    setEditingId(null)
    setForm(createEmptyFormState())
  }

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value

    setForm((current) => ({
      ...current,
      [target.name]: value,
    }))
  }

  const handleEdit = (producto: Producto) => {
    setEditingId(producto.id)
    setForm(mapProductoToForm(producto))
    setFeedback(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (producto: Producto) => {
    const confirmed = window.confirm(
      `Eliminar "${producto.nombre}" del catalogo?`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteProducto(producto.id)
      setProductos((current) =>
        current.filter((currentProducto) => currentProducto.id !== producto.id),
      )
      setFeedback(`"${producto.nombre}" fue eliminado.`)
      setError(null)

      if (editingId === producto.id) {
        resetForm()
      }
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible eliminar el producto seleccionado.',
        ),
      )
      setFeedback(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSaving(true)
      const payload = buildPayload(form)

      if (editingId) {
        const updated = await updateProducto(editingId, payload)
        setProductos((current) =>
          current.map((producto) =>
            producto.id === updated.id ? updated : producto,
          ),
        )
        setFeedback(`"${updated.nombre}" se actualizo correctamente.`)
      } else {
        const created = await createProducto(payload)
        setProductos((current) => [created, ...current])
        setFeedback(`"${created.nombre}" se creo correctamente.`)
      }

      setError(null)
      resetForm()
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible guardar el producto. Revisa los datos del formulario.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="content-stack">
      <section className="section-heading">
        <div>
          <h2>Gestion de productos</h2>
          <p>
            Crea, actualiza o elimina referencias del catalogo usando los
            endpoints protegidos con JWT.
          </p>
        </div>
        <div className="toolbar-actions">
          {editingId ? (
            <button
              className="button button--ghost"
              onClick={resetForm}
              type="button"
            >
              Cancelar edicion
            </button>
          ) : null}
          <span className="small-label">{productos.length} registrados</span>
        </div>
      </section>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {feedback ? <div className="alert alert--success">{feedback}</div> : null}

      <section className="admin-products-grid">
        <article className="admin-card">
          <div className="section-heading">
            <h2>{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
            <span className="small-label">
              {editingId ? `ID ${editingId}` : 'Formulario admin'}
            </span>
          </div>

          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field-group">
                <span className="field-label">Nombre</span>
                <input
                  className="text-input"
                  name="nombre"
                  onChange={handleInputChange}
                  required
                  value={form.nombre}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Marca</span>
                <input
                  className="text-input"
                  name="marca"
                  onChange={handleInputChange}
                  required
                  value={form.marca}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Categoria</span>
                <input
                  className="text-input"
                  name="categoria"
                  onChange={handleInputChange}
                  required
                  value={form.categoria}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Precio</span>
                <input
                  className="text-input"
                  min="0"
                  name="precio"
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  type="number"
                  value={form.precio}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Existencia</span>
                <input
                  className="text-input"
                  min="0"
                  name="existencia"
                  onChange={handleInputChange}
                  required
                  step="1"
                  type="number"
                  value={form.existencia}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Imagen principal</span>
                <input
                  className="text-input"
                  name="imagenPrincipal"
                  onChange={handleInputChange}
                  placeholder="https://..."
                  value={form.imagenPrincipal}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Tallas</span>
                <input
                  className="text-input"
                  name="tallas"
                  onChange={handleInputChange}
                  placeholder="CH, M, G"
                  value={form.tallas}
                />
              </label>

              <label className="field-group">
                <span className="field-label">Colores</span>
                <input
                  className="text-input"
                  name="colores"
                  onChange={handleInputChange}
                  placeholder="Negro, Marfil"
                  value={form.colores}
                />
              </label>

              <label className="field-group field-group--full">
                <span className="field-label">Descripcion</span>
                <textarea
                  className="text-area"
                  name="descripcion"
                  onChange={handleInputChange}
                  required
                  value={form.descripcion}
                />
              </label>

              <label className="field-group field-group--full">
                <span className="field-label">Imagenes secundarias</span>
                <textarea
                  className="text-area"
                  name="imagenes"
                  onChange={handleInputChange}
                  placeholder="Una URL por linea o separadas por coma"
                  value={form.imagenes}
                />
              </label>

              <label className="checkbox-row field-group--full">
                <input
                  checked={form.activo}
                  name="activo"
                  onChange={handleInputChange}
                  type="checkbox"
                />
                <span>Producto activo y visible en el catalogo</span>
              </label>
            </div>

            <div className="inline-actions">
              <button
                className="button button--primary"
                disabled={saving}
                type="submit"
              >
                {saving
                  ? 'Guardando...'
                  : editingId
                    ? 'Guardar cambios'
                    : 'Crear producto'}
              </button>
              <button
                className="button button--ghost"
                onClick={resetForm}
                type="button"
              >
                Limpiar formulario
              </button>
            </div>
          </form>
        </article>

        <article className="admin-card">
          <div className="section-heading">
            <h2>Listado admin</h2>
            <span className="small-label">
              {loading ? 'Actualizando...' : 'Sincronizado con API'}
            </span>
          </div>

          {loading ? (
            <div className="loading-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index} />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="empty-state">
              No hay productos registrados. Usa el formulario para crear el
              primero.
            </div>
          ) : (
            <div className="product-list">
              {productos.map((producto) => (
                <div className="admin-product-card" key={producto.id}>
                  <div className="product-media">
                    {producto.imagenPrincipal ? (
                      <img alt={producto.nombre} src={producto.imagenPrincipal} />
                    ) : (
                      <div className="media-fallback">Noir & Blanc</div>
                    )}
                  </div>

                  <div>
                    <div className="catalog-footer">
                      <div>
                        <p className="small-label">{producto.categoria}</p>
                        <h3 className="catalog-name">{producto.nombre}</h3>
                      </div>
                      <span
                        className={`status-chip ${
                          producto.activo ? 'is-active' : 'is-inactive'
                        }`}
                      >
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <p className="catalog-description">{producto.descripcion}</p>

                    <div className="admin-product-meta">
                      <span className="meta-chip">{producto.marca}</span>
                      <span className="meta-chip">{formatPrecio(producto.precio)}</span>
                      <span className="meta-chip">
                        {producto.existencia} en inventario
                      </span>
                    </div>

                    <div className="admin-product-actions">
                      <button
                        className="button button--secondary"
                        onClick={() => handleEdit(producto)}
                        type="button"
                      >
                        Editar
                      </button>
                      <button
                        className="button button--danger"
                        onClick={() => void handleDelete(producto)}
                        type="button"
                      >
                        Eliminar
                      </button>
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
