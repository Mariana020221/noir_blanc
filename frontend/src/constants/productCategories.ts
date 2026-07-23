export interface ProductCategoryOption {
  value: string
  label: string
  description: string
}

export const ALL_PRODUCT_CATEGORIES_VALUE = 'TODOS'

export const PRODUCT_CATEGORY_OPTIONS: ProductCategoryOption[] = [
  {
    value: 'NUEVOS',
    label: 'Nuevos',
    description: 'Ingresos recientes',
  },
  {
    value: 'HOMBRE',
    label: 'Hombre',
    description: 'Coleccion masculina',
  },
  {
    value: 'MUJER',
    label: 'Mujer',
    description: 'Coleccion femenina',
  },
  {
    value: 'ACCESORIOS',
    label: 'Accesorios',
    description: 'Bolsos, gorras y detalles',
  },
  {
    value: 'CALZADO',
    label: 'Calzado',
    description: 'Tenis, botas y zapatos',
  },
  {
    value: 'SALE',
    label: 'Sale',
    description: 'Piezas con precio especial',
  },
]

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

export const normalizeProductCategory = (value: string) =>
  value.trim().toUpperCase()

export const getProductCategoryLabel = (value: string) => {
  const normalizedValue = normalizeProductCategory(value)
  const match = PRODUCT_CATEGORY_OPTIONS.find(
    (option) => option.value === normalizedValue,
  )

  return match?.label ?? toTitleCase(normalizedValue)
}

export const buildSelectableProductCategoryOptions = (currentValue?: string) => {
  const normalizedCurrentValue = currentValue
    ? normalizeProductCategory(currentValue)
    : ''

  if (
    !normalizedCurrentValue ||
    PRODUCT_CATEGORY_OPTIONS.some(
      (option) => option.value === normalizedCurrentValue,
    )
  ) {
    return PRODUCT_CATEGORY_OPTIONS
  }

  return [
    {
      value: normalizedCurrentValue,
      label: getProductCategoryLabel(normalizedCurrentValue),
      description: 'Categoria actual del producto',
    },
    ...PRODUCT_CATEGORY_OPTIONS,
  ]
}
