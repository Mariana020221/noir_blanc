import api, { API_URL, AUTH_TOKEN_STORAGE_KEY } from '../api/api'

export interface ProductoImagenColor {
  imagen: string
  color: string | null
  colorHex: string | null
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  existencia: number
  categoria: string
  categorias: string[]
  marca: string
  tallas: string[]
  colores: string[]
  imagenPrincipal: string | null
  imagenPrincipalColor: string | null
  imagenPrincipalColorHex: string | null
  imagenes: string[]
  imagenesPorColor: ProductoImagenColor[]
  activo: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ProductoFilters {
  nombre?: string
  categoria?: string
  marca?: string
  activo?: boolean
}

export interface ProductoPayload {
  nombre: string
  descripcion: string
  precio: number
  existencia: number
  categoria: string
  categorias?: string[]
  marca: string
  tallas: string[]
  colores: string[]
  imagenPrincipal?: string | null
  imagenPrincipalColor?: string | null
  imagenPrincipalColorHex?: string | null
  imagenes: string[]
  imagenesPorColor?: ProductoImagenColor[]
  activo?: boolean
}

interface UploadProductoImagesResponse {
  paths: string[]
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export const formatPrecio = (precio: number) => currencyFormatter.format(precio)

const resolveImageUrl = (path: string | null | undefined) => {
  if (!path?.trim()) {
    return null
  }

  if (/^https?:\/\//i.test(path)) {
    return path
  }

  return new URL(path, `${API_URL}/`).toString()
}

const buildUniqueTextValues = (values: Array<string | null | undefined>) => {
  const uniqueValues = new Map<string, string>()

  values.forEach((value) => {
    const normalizedValue = value?.trim() ?? ''

    if (!normalizedValue) {
      return
    }

    const normalizedKey = normalizedValue.toLowerCase()

    if (!uniqueValues.has(normalizedKey)) {
      uniqueValues.set(normalizedKey, normalizedValue)
    }
  })

  return Array.from(uniqueValues.values())
}

const normalizeProducto = (producto: Producto): Producto => {
  const uniqueImageAssignments = new Map<string, ProductoImagenColor>()
  ;(producto.imagenesPorColor ?? []).forEach((item) => {
    const imagen = resolveImageUrl(item.imagen)

    if (!imagen || uniqueImageAssignments.has(imagen)) {
      return
    }

    uniqueImageAssignments.set(imagen, {
      ...item,
      imagen,
    })
  })
  const imagenesPorColor = Array.from(uniqueImageAssignments.values()).map(
    (item) => {
      const imagen = resolveImageUrl(item.imagen)

      if (!imagen) {
        return null
      }

      return {
        ...item,
        imagen,
      }
    })
    .filter((item): item is ProductoImagenColor => Boolean(item))
  const imagenes = Array.from(
    new Set(
      [
        ...producto.imagenes
          .map((image) => resolveImageUrl(image))
          .filter((image): image is string => Boolean(image)),
        ...imagenesPorColor.map((item) => item.imagen),
      ],
    ),
  )
  const imagenPrincipal =
    resolveImageUrl(producto.imagenPrincipal) ?? imagenes[0] ?? null

  return {
    ...producto,
    categoria: producto.categoria.trim(),
    categorias:
      producto.categorias?.length > 0
        ? buildUniqueTextValues(producto.categorias)
        : buildUniqueTextValues([producto.categoria]),
    marca: producto.marca.trim(),
    tallas: buildUniqueTextValues(producto.tallas ?? []),
    colores: buildUniqueTextValues(producto.colores ?? []),
    imagenPrincipal,
    imagenes,
    imagenesPorColor,
  }
}

const buildUploadError = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string | string[] }

    if (Array.isArray(data.message) && data.message.length > 0) {
      return new Error(data.message.join(' '))
    }

    if (typeof data.message === 'string' && data.message.trim()) {
      return new Error(data.message)
    }
  } catch {
    // Usa el mensaje generico definido mas abajo si la respuesta no es JSON.
  }

  if (response.status === 404) {
    return new Error(
      'La API activa no tiene habilitada la ruta de carga de imagenes. Reinicia el backend y vuelve a intentar la subida.',
    )
  }

  return new Error('No fue posible subir las imagenes seleccionadas.')
}

export const getProductos = async (filters?: ProductoFilters) => {
  const { data } = await api.get<Producto[]>('/productos', {
    params: filters,
  })

  return data.map(normalizeProducto)
}

export const getProductoById = async (id: number) => {
  const { data } = await api.get<Producto>(`/productos/${id}`)

  return normalizeProducto(data)
}

export const createProducto = async (payload: ProductoPayload) => {
  const { data } = await api.post<Producto>('/productos', payload)

  return normalizeProducto(data)
}

export const uploadProductoImages = async (files: File[]) => {
  const formData = new FormData()
  const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)

  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await fetch(`${API_URL}/productos/uploads`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body: formData,
  })

  if (!response.ok) {
    throw await buildUploadError(response)
  }

  const data = (await response.json()) as UploadProductoImagesResponse
  const resolvedPaths = data.paths
    .map((path) => resolveImageUrl(path))
    .filter((path): path is string => Boolean(path))

  if (resolvedPaths.length === 0) {
    throw new Error('La API no devolvio rutas de imagen validas para el producto.')
  }

  return resolvedPaths
}

export const updateProducto = async (
  id: number,
  payload: Partial<ProductoPayload>,
) => {
  const { data } = await api.patch<Producto>(`/productos/${id}`, payload)

  return normalizeProducto(data)
}

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`)
}
