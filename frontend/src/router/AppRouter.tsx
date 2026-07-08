import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { SuperUserRoute } from '../auth/SuperUserRoute'
import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardPage } from '../pages/admin/DashboardPage'
import {
  ProductosCrearPage,
  ProductosEditarPage,
} from '../pages/admin/ProductosAdminPage'
import { UsuariosAdminPage } from '../pages/admin/UsuariosAdminPage'
import { CatalogoPage } from '../pages/public/CatalogoPage'
import { ProductoDetallePage } from '../pages/public/ProductoDetallePage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<CatalogoPage />} path="/" />
        <Route element={<CatalogoPage />} path="/login" />
        <Route element={<ProductoDetallePage />} path="/producto/:id" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<SuperUserRoute />}>
          <Route element={<AdminLayout />} path="/admin">
            <Route element={<DashboardPage />} index />
            <Route element={<UsuariosAdminPage />} path="usuarios" />
            <Route path="productos">
              <Route element={<Navigate replace to="crear" />} index />
              <Route element={<ProductosCrearPage />} path="crear" />
              <Route element={<ProductosEditarPage />} path="editar" />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  </BrowserRouter>
)
