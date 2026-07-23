import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DropdownSelect } from '../components/DropdownSelect'
import {
  ALL_PRODUCT_CATEGORIES_VALUE,
  PRODUCT_CATEGORY_OPTIONS,
  normalizeProductCategory,
} from '../constants/productCategories'
import { LoginPage } from '../pages/auth/LoginPage'
import { getProductos } from '../services/productos.service'

const buildUniqueLabels = (items: string[]) => {
  const uniqueValues = new Map<string, string>()

  items.forEach((item) => {
    const normalizedValue = item.trim()

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

export const PublicLayout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isSuperUser, logout } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const showLoginOverlay = location.pathname === '/login'
  const isCatalogHomeView = location.pathname === '/' || showLoginOverlay
  const isProductDetailView = location.pathname.startsWith('/producto/')
  const isCatalogView =
    isCatalogHomeView || isProductDetailView
  const selectedCategory = normalizeProductCategory(
    searchParams.get('categoria') ?? ALL_PRODUCT_CATEGORIES_VALUE,
  )
  const selectedBrand = isCatalogView ? searchParams.get('marca')?.trim() ?? '' : ''
  const [brandOptions, setBrandOptions] = useState<string[]>([])

  useEffect(() => {
    if (!isCatalogView) {
      return
    }

    let active = true

    const loadBrands = async () => {
      try {
        const productos = await getProductos()

        if (!active) {
          return
        }

        const marcas = buildUniqueLabels(
          productos
            .filter((producto) => producto.activo)
            .map((producto) => producto.marca.trim()),
        ).sort((left, right) => left.localeCompare(right))

        setBrandOptions(marcas)
      } catch {
        if (active) {
          setBrandOptions([])
        }
      }
    }

    void loadBrands()

    return () => {
      active = false
    }
  }, [isCatalogView])

  const buildCatalogRoute = (
    nextCategory: string,
    nextBrand: string,
  ) => {
    const params = new URLSearchParams()

    if (nextCategory !== ALL_PRODUCT_CATEGORIES_VALUE) {
      params.set('categoria', nextCategory)
    }

    if (nextBrand.trim()) {
      params.set('marca', nextBrand.trim())
    }

    const query = params.toString()

    return query ? `/?${query}` : '/'
  }

  return (
    <div className="app-shell public-layout">
      <header className="public-header">
        <div className="brand-lockup">
          <NavLink className="brand-mark" to="/">
            NOIR&BLANC
          </NavLink>
          <span className="brand-subtitle">Collection</span>
        </div>

        <div className="public-header-center">
          <nav
            className="public-category-nav public-category-nav--desktop"
            aria-label="Categorias del catálogo"
          >
            <NavLink
              className={`public-category-link${
                selectedCategory === ALL_PRODUCT_CATEGORIES_VALUE ? ' is-active' : ''
              }`}
              to={buildCatalogRoute(ALL_PRODUCT_CATEGORIES_VALUE, selectedBrand)}
            >
              Todos
            </NavLink>
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <NavLink
                className={`public-category-link${
                  selectedCategory === option.value ? ' is-active' : ''
                }`}
                key={option.value}
                to={buildCatalogRoute(option.value, selectedBrand)}
              >
                {option.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-header-filters">
            <div
              className={`public-header-dropdown public-header-dropdown--categories${
                selectedCategory !== ALL_PRODUCT_CATEGORIES_VALUE ? ' is-filtered' : ''
              }`}
            >
              <DropdownSelect
                ariaLabel="Categorias"
                buttonLabel="Categorias"
                className="public-header-dropdown-select"
                onChange={(nextValue) =>
                  navigate(buildCatalogRoute(nextValue, selectedBrand))
                }
                options={[
                  {
                    label: 'Todas las categorias',
                    value: ALL_PRODUCT_CATEGORIES_VALUE,
                  },
                  ...PRODUCT_CATEGORY_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.value,
                  })),
                ]}
                showMenuIcon
                size="header"
                value={selectedCategory}
              />
            </div>

            {isCatalogView && brandOptions.length > 0 ? (
              <div
                className={`public-header-dropdown public-header-dropdown--brand${
                  selectedBrand ? ' is-filtered' : ''
                }`}
              >
                <DropdownSelect
                  ariaLabel="Marcas"
                  buttonLabel="Marcas"
                  className="public-header-dropdown-select public-header-dropdown-select--brand"
                  onChange={(nextValue) =>
                    navigate(buildCatalogRoute(selectedCategory, nextValue))
                  }
                  options={[
                    ...brandOptions.map((brand) => ({
                      label: brand,
                      value: brand,
                    })),
                  ]}
                  showMenuIcon
                  showSelectedText={false}
                  size="header"
                  value={selectedBrand}
                />
              </div>
            ) : null}
          </div>
        </div>

        <nav
          className={`public-nav public-nav--actions${
            isCatalogHomeView ? ' is-catalog-view' : ''
          }`}
          aria-label="Navegacion principal"
        >
          <NavLink
            className={({ isActive }) =>
              `nav-pill${isActive ? ' is-active' : ''}`
            }
            to="/"
          >
            Catálogo
          </NavLink>
          {isSuperUser ? (
            <NavLink
              className={({ isActive }) =>
                `nav-pill${isActive ? ' is-active' : ''}`
              }
              to="/admin"
            >
              Panel admin
            </NavLink>
          ) : null}
          {isAuthenticated && !isSuperUser ? (
            <button
              className="nav-pill public-nav-button"
              onClick={() => logout()}
              type="button"
            >
              Cerrar sesión
            </button>
          ) : null}
          {!isAuthenticated ? (
            <NavLink
              className={() =>
                `nav-pill${showLoginOverlay ? ' is-active' : ''}`
              }
              to="/login"
            >
              Iniciar sesión
            </NavLink>
          ) : null}
        </nav>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <span>Noir&Blanc selecciona siluetas sobrias para un guardarropa sereno.</span>
        <span>Catálogo público y gestión privada sincronizados con tu API.</span>
      </footer>

      {showLoginOverlay ? <LoginPage overlay /> : null}
    </div>
  )
}
