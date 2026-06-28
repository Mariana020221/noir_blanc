import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { AdminLayout } from '../layouts/AdminLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { DashboardPage } from '../pages/admin/DashboardPage'
import { ProductosAdminPage } from '../pages/admin/ProductosAdminPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { CatalogoPage } from '../pages/public/CatalogoPage'
import { ProductoDetallePage } from '../pages/public/ProductoDetallePage'

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<CatalogoPage />} path="/" />
        <Route element={<ProductoDetallePage />} path="/producto/:id" />
      </Route>

      <Route element={<LoginPage />} path="/login" />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />} path="/admin">
          <Route element={<DashboardPage />} index />
          <Route element={<ProductosAdminPage />} path="productos" />
        </Route>
      </Route>

      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  </BrowserRouter>
)
