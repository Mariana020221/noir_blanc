import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getApiErrorMessage } from '../../api/api'
import {
  createProducto,
  deleteProducto,
  formatPrecio,
  getProductos,
  uploadProductoImages,
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

type ProductoImageField = 'imagenPrincipal' | 'imagenes'
type ProductosAdminMode = 'crear' | 'editar'

interface UploadPreviewState {
  imagenPrincipal: string[]
  imagenes: string[]
}

interface ImageDropzoneProps {
  description: string
  images: string[]
  isUploading?: boolean
  label: string
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
  onRemoveImage: (index: number) => void
}

interface ProductoFormFieldsProps {
  form: ProductoFormState
  onImageUpload: (field: ProductoImageField, files: File[]) => void
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onRemovePrimaryImage: () => void
  onRemoveSecondaryImage: (index: number) => void
  previewState: UploadPreviewState
  uploadingField: ProductoImageField | null
}

interface ProductosAdminPageProps {
  mode: ProductosAdminMode
}

const acceptedImageTypes =
  'image/jpeg,image/png,image/webp,image/avif,image/gif'

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

const createEmptyPreviewState = (): UploadPreviewState => ({
  imagenPrincipal: [],
  imagenes: [],
})

const parseList = (value: string) =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)

const serializeList = (items: string[]) => items.join('\n')

const mergeListValue = (currentValue: string, newItems: string[]) =>
  serializeList(Array.from(new Set([...parseList(currentValue), ...newItems])))

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

const applyUploadedUrlsToForm = (
  form: ProductoFormState,
  field: ProductoImageField,
  urls: string[],
): ProductoFormState => ({
  ...form,
  ...(field === 'imagenPrincipal'
    ? {
        imagenPrincipal: urls[0] ?? form.imagenPrincipal,
      }
    : {
        imagenes: mergeListValue(form.imagenes, urls),
      }),
})

const removePrimaryImageFromForm = (form: ProductoFormState): ProductoFormState => ({
  ...form,
  imagenPrincipal: '',
})

const removeSecondaryImageFromForm = (
  form: ProductoFormState,
  indexToRemove: number,
): ProductoFormState => ({
  ...form,
  imagenes: serializeList(
    parseList(form.imagenes).filter((_, index) => index !== indexToRemove),
  ),
})

const revokePreviewUrls = (urls: string[]) => {
  urls.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
}

const replacePreviewField = (
  current: UploadPreviewState,
  field: ProductoImageField,
  nextUrls: string[],
): UploadPreviewState => {
  revokePreviewUrls(current[field])

  return {
    ...current,
    [field]: nextUrls,
  }
}

const syncPreviewWithForm = (
  form: ProductoFormState,
  field: ProductoImageField,
): string[] =>
  field === 'imagenPrincipal'
    ? form.imagenPrincipal.trim()
      ? [form.imagenPrincipal.trim()]
      : []
    : parseList(form.imagenes)

const removePreviewImageFromState = (
  current: UploadPreviewState,
  field: ProductoImageField,
  indexToRemove?: number,
): UploadPreviewState => {
  if (current[field].length === 0) {
    return current
  }

  if (field === 'imagenPrincipal') {
    return replacePreviewField(current, field, [])
  }

  return replacePreviewField(
    current,
    field,
    current.imagenes.filter((_, index) => index !== indexToRemove),
  )
}

const clearPreviewState = (current: UploadPreviewState): UploadPreviewState => {
  revokePreviewUrls(current.imagenPrincipal)
  revokePreviewUrls(current.imagenes)

  return createEmptyPreviewState()
}

const createObjectPreviewUrls = (files: File[]) =>
  files.map((file) => URL.createObjectURL(file))

const AdminProductMedia = ({
  alt,
  src,
}: {
  alt: string
  src: string | null
}) => {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  return (
    <div className="product-media">
      {src && !hasError ? (
        <img alt={alt} onError={() => setHasError(true)} src={src} />
      ) : (
        <div className="media-fallback">Noir & Blanc</div>
      )}
    </div>
  )
}

const ImageDropzone = ({
  description,
  images,
  isUploading = false,
  label,
  multiple = false,
  onFilesSelected,
  onRemoveImage,
}: ImageDropzoneProps) => {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const openFilePicker = () => {
    if (isUploading) {
      return
    }

    inputRef.current?.click()
  }

  const selectFiles = (fileList: FileList | null) => {
    if (!fileList?.length || isUploading) {
      return
    }

    onFilesSelected(Array.from(fileList))
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectFiles(event.target.files)
    event.target.value = ''
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (isUploading) {
      return
    }

    setIsDragActive(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (isUploading) {
      return
    }

    event.dataTransfer.dropEffect = 'copy'
    setIsDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return
    }

    setIsDragActive(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    selectFiles(event.dataTransfer.files)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    openFilePicker()
  }

  return (
    <div className="field-group field-group--full">
      <span className="field-label">{label}</span>

      <input
        accept={acceptedImageTypes}
        className="sr-only"
        id={inputId}
        multiple={multiple}
        onChange={handleInputChange}
        ref={inputRef}
        type="file"
      />

      <div
        aria-disabled={isUploading}
        className={`upload-dropzone${isDragActive ? ' is-dragging' : ''}${
          isUploading ? ' is-uploading' : ''
        }`}
        onClick={openFilePicker}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={isUploading ? -1 : 0}
      >
        <span className="small-label">
          {multiple ? 'Carga multiple' : 'Carga individual'}
        </span>
        <strong>
          {isUploading
            ? 'Subiendo imagenes...'
            : 'Haz clic para escoger archivos o arrastralos aqui'}
        </strong>
        <p className="muted-text">{description}</p>
      </div>

      {images.length > 0 ? (
        <div className="upload-preview-grid">
          {images.map((image, index) => (
            <div className="upload-preview-card" key={`${image}-${index}`}>
              <div className="upload-preview-media">
                <img alt={`${label} ${index + 1}`} src={image} />
              </div>

              <div className="upload-preview-footer">
                <span className="small-label">
                  {multiple ? `Foto ${index + 1}` : 'Imagen actual'}
                </span>
                <button
                  className="upload-preview-remove"
                  disabled={isUploading}
                  onClick={() => onRemoveImage(index)}
                  type="button"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const ProductoFormFields = ({
  form,
  onImageUpload,
  onInputChange,
  onRemovePrimaryImage,
  onRemoveSecondaryImage,
  previewState,
  uploadingField,
}: ProductoFormFieldsProps) => {
  const principalImage = form.imagenPrincipal.trim()
  const secondaryImages = parseList(form.imagenes)
  const principalPreview =
    previewState.imagenPrincipal.length > 0
      ? previewState.imagenPrincipal
      : principalImage
        ? [principalImage]
        : []
  const secondaryPreview =
    previewState.imagenes.length > 0 ? previewState.imagenes : secondaryImages

  return (
    <div className="form-grid">
      <label className="field-group">
        <span className="field-label">Nombre</span>
        <input
          className="text-input"
          name="nombre"
          onChange={onInputChange}
          required
          value={form.nombre}
        />
      </label>

      <label className="field-group">
        <span className="field-label">Marca</span>
        <input
          className="text-input"
          name="marca"
          onChange={onInputChange}
          required
          value={form.marca}
        />
      </label>

      <label className="field-group">
        <span className="field-label">Categoria</span>
        <input
          className="text-input"
          name="categoria"
          onChange={onInputChange}
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
          onChange={onInputChange}
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
          onChange={onInputChange}
          required
          step="1"
          type="number"
          value={form.existencia}
        />
      </label>

      <ImageDropzone
        description="Acepta JPG, PNG, WEBP, AVIF o GIF. Puedes hacer clic o arrastrar la foto principal y la previsualizacion aparece aqui mismo."
        images={principalPreview}
        isUploading={uploadingField === 'imagenPrincipal'}
        label="Imagen principal"
        onFilesSelected={(files) => onImageUpload('imagenPrincipal', files)}
        onRemoveImage={onRemovePrimaryImage}
      />

      <label className="field-group">
        <span className="field-label">Tallas</span>
        <input
          className="text-input"
          name="tallas"
          onChange={onInputChange}
          placeholder="CH, M, G"
          value={form.tallas}
        />
      </label>

      <label className="field-group">
        <span className="field-label">Colores</span>
        <input
          className="text-input"
          name="colores"
          onChange={onInputChange}
          placeholder="Negro, Marfil"
          value={form.colores}
        />
      </label>

      <label className="field-group field-group--full">
        <span className="field-label">Descripcion</span>
        <textarea
          className="text-area"
          name="descripcion"
          onChange={onInputChange}
          required
          value={form.descripcion}
        />
      </label>

      <ImageDropzone
        description="Sube varias fotos secundarias o arrastralas al area para agregarlas a la galeria del producto con previsualizacion inmediata."
        images={secondaryPreview}
        isUploading={uploadingField === 'imagenes'}
        label="Imagenes secundarias"
        multiple
        onFilesSelected={(files) => onImageUpload('imagenes', files)}
        onRemoveImage={onRemoveSecondaryImage}
      />

      <label className="checkbox-row field-group--full">
        <input
          checked={form.activo}
          name="activo"
          onChange={onInputChange}
          type="checkbox"
        />
        <span>Producto activo y visible en el catalogo</span>
      </label>
    </div>
  )
}

const ProductosAdminPage = ({ mode }: ProductosAdminPageProps) => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedProductParam = searchParams.get('productoId')
  const [productos, setProductos] = useState<Producto[]>([])
  const [createForm, setCreateForm] = useState<ProductoFormState>(createEmptyFormState)
  const [editForm, setEditForm] = useState<ProductoFormState | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [createSaving, setCreateSaving] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [createUploadingField, setCreateUploadingField] =
    useState<ProductoImageField | null>(null)
  const [editUploadingField, setEditUploadingField] =
    useState<ProductoImageField | null>(null)
  const [createPreviewState, setCreatePreviewState] = useState<UploadPreviewState>(
    createEmptyPreviewState,
  )
  const [editPreviewState, setEditPreviewState] = useState<UploadPreviewState>(
    createEmptyPreviewState,
  )
  const createFormRef = useRef(createForm)
  const editFormRef = useRef(editForm)
  const createPreviewRef = useRef(createPreviewState)
  const editPreviewRef = useRef(editPreviewState)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createFormRef.current = createForm
  }, [createForm])

  useEffect(() => {
    editFormRef.current = editForm
  }, [editForm])

  useEffect(() => {
    createPreviewRef.current = createPreviewState
  }, [createPreviewState])

  useEffect(() => {
    editPreviewRef.current = editPreviewState
  }, [editPreviewState])

  useEffect(() => {
    return () => {
      clearPreviewState(createPreviewRef.current)
      clearPreviewState(editPreviewRef.current)
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadProductos = async () => {
      try {
        setLoading(true)
        const response = await getProductos()

        if (!active) {
          return
        }

        setProductos(response)
        setError(null)

        if (mode !== 'editar') {
          return
        }

        if (!selectedProductParam) {
          return
        }

        const selectedId = Number(selectedProductParam)

        if (Number.isNaN(selectedId)) {
          return
        }

        const selectedProduct = response.find((producto) => producto.id === selectedId)

        if (!selectedProduct) {
          return
        }

        setEditingId(selectedProduct.id)
        setEditForm(mapProductoToForm(selectedProduct))
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
  }, [mode, selectedProductParam])

  const resetCreateForm = () => {
    setCreateForm(createEmptyFormState())
    setCreatePreviewState((current) => clearPreviewState(current))
  }

  const resetEditForm = () => {
    setEditingId(null)
    setEditForm(null)
    setEditPreviewState((current) => clearPreviewState(current))

    if (searchParams.has('productoId')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('productoId')
      setSearchParams(nextParams, { replace: true })
    }
  }

  const handleCreateInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value

    setCreateForm((current) => ({
      ...current,
      [target.name]: value,
    }))
  }

  const handleEditInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = event.target
    const value =
      target instanceof HTMLInputElement && target.type === 'checkbox'
        ? target.checked
        : target.value

    setEditForm((current) =>
      current
        ? {
            ...current,
            [target.name]: value,
          }
        : current,
    )
  }

  const selectProductForEdit = (producto: Producto) => {
    setEditingId(producto.id)
    setEditForm(mapProductoToForm(producto))
    setEditPreviewState((current) => clearPreviewState(current))
    setFeedback(null)
    setError(null)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('productoId', String(producto.id))
    setSearchParams(nextParams, { replace: true })
  }

  const handleEditIntent = (producto: Producto) => {
    if (mode === 'editar') {
      selectProductForEdit(producto)
      return
    }

    navigate(`/admin/productos/editar?productoId=${producto.id}`)
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
        resetEditForm()
      }
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible eliminar el producto seleccionado.',
        ),
      )
    }
  }

  const handleCreateImageUpload = async (
    field: ProductoImageField,
    files: File[],
  ) => {
    const filesToUpload = field === 'imagenPrincipal' ? files.slice(0, 1) : files

    if (filesToUpload.length === 0) {
      return
    }

    setCreatePreviewState((current) =>
      replacePreviewField(current, field, createObjectPreviewUrls(filesToUpload)),
    )

    try {
      setCreateUploadingField(field)
      const urls = await uploadProductoImages(filesToUpload)
      const nextForm = applyUploadedUrlsToForm(createFormRef.current, field, urls)

      setCreateForm(nextForm)
      setCreatePreviewState((current) =>
        replacePreviewField(current, field, syncPreviewWithForm(nextForm, field)),
      )
      setError(null)
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible subir las imagenes seleccionadas.',
        ),
      )
    } finally {
      setCreateUploadingField(null)
    }
  }

  const handleEditImageUpload = async (
    field: ProductoImageField,
    files: File[],
  ) => {
    const filesToUpload = field === 'imagenPrincipal' ? files.slice(0, 1) : files

    if (filesToUpload.length === 0 || !editForm) {
      return
    }

    setEditPreviewState((current) =>
      replacePreviewField(current, field, createObjectPreviewUrls(filesToUpload)),
    )

    try {
      setEditUploadingField(field)
      const urls = await uploadProductoImages(filesToUpload)
      const currentForm = editFormRef.current

      if (!currentForm) {
        return
      }

      const nextForm = applyUploadedUrlsToForm(currentForm, field, urls)

      setEditForm(nextForm)
      setEditPreviewState((current) =>
        replacePreviewField(current, field, syncPreviewWithForm(nextForm, field)),
      )
      setError(null)
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible subir las imagenes seleccionadas.',
        ),
      )
    } finally {
      setEditUploadingField(null)
    }
  }

  const handleCreatePrimaryImageRemove = () => {
    setCreateForm((current) => removePrimaryImageFromForm(current))
    setCreatePreviewState((current) =>
      removePreviewImageFromState(current, 'imagenPrincipal'),
    )
  }

  const handleCreateSecondaryImageRemove = (index: number) => {
    setCreateForm((current) => removeSecondaryImageFromForm(current, index))
    setCreatePreviewState((current) =>
      removePreviewImageFromState(current, 'imagenes', index),
    )
  }

  const handleEditPrimaryImageRemove = () => {
    setEditForm((current) => (current ? removePrimaryImageFromForm(current) : current))
    setEditPreviewState((current) =>
      removePreviewImageFromState(current, 'imagenPrincipal'),
    )
  }

  const handleEditSecondaryImageRemove = (index: number) => {
    setEditForm((current) =>
      current ? removeSecondaryImageFromForm(current, index) : current,
    )
    setEditPreviewState((current) =>
      removePreviewImageFromState(current, 'imagenes', index),
    )
  }

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setCreateSaving(true)
      const created = await createProducto(buildPayload(createForm))

      setProductos((current) => [created, ...current])
      setFeedback(null)
      setError(null)
      resetCreateForm()
      await Swal.fire({
        icon: 'success',
        title: 'Producto creado',
        text: `${created.nombre} se creo correctamente.`,
        confirmButtonText: 'Continuar',
        background: '#fffdf9',
        confirmButtonColor: '#1d1a17',
      })
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible crear el producto. Revisa los datos del formulario.',
        ),
      )
    } finally {
      setCreateSaving(false)
    }
  }

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingId || !editForm) {
      return
    }

    try {
      setEditSaving(true)
      const updated = await updateProducto(editingId, buildPayload(editForm))

      setProductos((current) =>
        current.map((producto) =>
          producto.id === updated.id ? updated : producto,
        ),
      )
      setEditForm(mapProductoToForm(updated))
      setFeedback(null)
      setError(null)
      await Swal.fire({
        icon: 'success',
        title: 'Producto actualizado',
        text: `${updated.nombre} se actualizo correctamente.`,
        confirmButtonText: 'Continuar',
        background: '#fffdf9',
        confirmButtonColor: '#1d1a17',
      })
    } catch (requestError) {
      setFeedback(null)
      setError(
        getApiErrorMessage(
          requestError,
          'No fue posible guardar los cambios del producto.',
        ),
      )
    } finally {
      setEditSaving(false)
    }
  }

  const isCreateUploading = createUploadingField !== null
  const isEditUploading = editUploadingField !== null
  const pageTitle = mode === 'crear' ? 'Crear productos' : 'Editar productos'
  const pageDescription =
    mode === 'crear'
      ? 'Da de alta nuevas piezas desde un modulo dedicado y conserva la lista del catalogo a la vista.'
      : 'Trabaja solo sobre productos existentes, con un editor separado y una lista pensada para seleccionar que cambiar.'
  const listTitle = 'Catalogo editable'
  const listHelper =
    'Selecciona un producto para cargarlo en el editor y ajustar sus datos.'

  return (
    <div className="content-stack">
      <section className="section-heading">
        <div>
          <h2>{pageTitle}</h2>
          <p>{pageDescription}</p>
        </div>
        <div className="admin-toolbar-meta">
          {mode === 'editar' ? (
            editingId ? (
              <span className="status-chip is-active">Editando ID {editingId}</span>
            ) : (
              <span className="status-chip">Selecciona un producto</span>
            )
          ) : (
            <span className="status-chip is-active">Modulo de alta</span>
          )}
          {mode === 'editar' ? (
            <span className="small-label">{productos.length} registrados</span>
          ) : null}
        </div>
      </section>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {feedback ? <div className="alert alert--success">{feedback}</div> : null}

      <section
        className={`admin-products-workspace${
          mode === 'crear' ? ' admin-products-workspace--create' : ''
        }`}
      >
        <article className="admin-card admin-card--sticky">
          {mode === 'crear' ? (
            <>
              <div className="section-heading">
                <div>
                  <h2>Crear producto</h2>
                  <span className="small-label">Alta independiente</span>
                </div>
              </div>

              <p className="admin-form-caption">
                La carga de fotos ahora muestra previsualizacion inmediata
                mientras sube el archivo y mantiene separado el flujo de altas.
              </p>

              <form className="product-form" onSubmit={handleCreateSubmit}>
                <ProductoFormFields
                  form={createForm}
                  onImageUpload={handleCreateImageUpload}
                  onInputChange={handleCreateInputChange}
                  onRemovePrimaryImage={handleCreatePrimaryImageRemove}
                  onRemoveSecondaryImage={handleCreateSecondaryImageRemove}
                  previewState={createPreviewState}
                  uploadingField={createUploadingField}
                />

                <div className="inline-actions">
                  <button
                    className="button button--primary"
                    disabled={createSaving || isCreateUploading}
                    type="submit"
                  >
                    {createSaving
                      ? 'Creando...'
                      : isCreateUploading
                        ? 'Subiendo imagenes...'
                        : 'Crear producto'}
                  </button>
                  <button
                    className="button button--ghost"
                    disabled={createSaving || isCreateUploading}
                    onClick={resetCreateForm}
                    type="button"
                  >
                    Limpiar formulario
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="section-heading">
                <div>
                  <h2>Editar producto</h2>
                  <span className="small-label">
                    {editingId ? `Producto #${editingId}` : 'Esperando seleccion'}
                  </span>
                </div>
                {editingId ? (
                  <button
                    className="button button--ghost"
                    disabled={editSaving || isEditUploading}
                    onClick={resetEditForm}
                    type="button"
                  >
                    Salir de edicion
                  </button>
                ) : null}
              </div>

              {!editForm || !editingId ? (
                <div className="empty-state">
                  Elige un producto del listado para cargarlo aqui en el editor.
                </div>
              ) : (
                <>
                  <p className="admin-form-caption">
                    Este modulo solo toca productos existentes y deja la creacion
                    aislada en su propia ruta del panel.
                  </p>

                  <form className="product-form" onSubmit={handleEditSubmit}>
                    <ProductoFormFields
                      form={editForm}
                      onImageUpload={handleEditImageUpload}
                      onInputChange={handleEditInputChange}
                      onRemovePrimaryImage={handleEditPrimaryImageRemove}
                      onRemoveSecondaryImage={handleEditSecondaryImageRemove}
                      previewState={editPreviewState}
                      uploadingField={editUploadingField}
                    />

                    <div className="inline-actions">
                      <button
                        className="button button--primary"
                        disabled={editSaving || isEditUploading}
                        type="submit"
                      >
                        {editSaving
                          ? 'Guardando...'
                          : isEditUploading
                            ? 'Subiendo imagenes...'
                            : 'Guardar cambios'}
                      </button>
                      <button
                        className="button button--ghost"
                        disabled={editSaving || isEditUploading}
                        onClick={resetEditForm}
                        type="button"
                      >
                        Cancelar edicion
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </article>

        {mode === 'editar' ? (
          <article className="admin-card">
            <div className="section-heading">
              <div>
                <h2>{listTitle}</h2>
                <p className="admin-form-caption">{listHelper}</p>
              </div>
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
                No hay productos registrados todavia.
              </div>
            ) : (
              <div className="product-list">
                {productos.map((producto) => (
                  <div className="admin-product-card" key={producto.id}>
                    <AdminProductMedia
                      alt={producto.nombre}
                      src={producto.imagenPrincipal}
                    />

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
                        <span className="meta-chip">
                          {formatPrecio(producto.precio)}
                        </span>
                        <span className="meta-chip">
                          {producto.existencia} en inventario
                        </span>
                      </div>

                      <div className="admin-product-actions">
                        <button
                          className="button button--secondary"
                          onClick={() => handleEditIntent(producto)}
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
        ) : null}
      </section>
    </div>
  )
}

export const ProductosCrearPage = () => <ProductosAdminPage mode="crear" />

export const ProductosEditarPage = () => <ProductosAdminPage mode="editar" />
