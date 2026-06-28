import api from '../api/api'

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  existencia: number
  categoria: string
  marca: string
  tallas: string[]
  colores: string[]
  imagenPrincipal: string | null
  imagenes: string[]
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
  marca: string
  tallas: string[]
  colores: string[]
  imagenPrincipal?: string | null
  imagenes: string[]
  activo?: boolean
}

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

export const formatPrecio = (precio: number) => currencyFormatter.format(precio)

export const getProductos = async (filters?: ProductoFilters) => {
  const { data } = await api.get<Producto[]>('/productos', {
    params: filters,
  })

  return data
}

export const getProductoById = async (id: number) => {
  const { data } = await api.get<Producto>(`/productos/${id}`)

  return data
}

export const createProducto = async (payload: ProductoPayload) => {
  const { data } = await api.post<Producto>('/productos', payload)

  return data
}

export const updateProducto = async (
  id: number,
  payload: Partial<ProductoPayload>,
) => {
  const { data } = await api.patch<Producto>(`/productos/${id}`, payload)

  return data
}

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`)
}
