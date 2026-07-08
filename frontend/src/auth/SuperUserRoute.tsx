import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

export const SuperUserRoute = () => {
  const { isAuthenticated, isSuperUser } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (!isSuperUser) {
    return <Navigate replace to="/" />
  }

  return <Outlet />
}
