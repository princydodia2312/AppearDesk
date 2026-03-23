import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/auth.store'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// Auth pages
import Login from './pages/auth/Login'

// Main pages
import Dashboard     from './pages/Dashboard'
import Products      from './pages/products/Products'
import Customers     from './pages/customers/Customers'
import Vendors       from './pages/vendors/Vendors'
import Orders        from './pages/orders/Orders'
import Invoices      from './pages/invoices/Invoices'
import Payments      from './pages/payments/Payments'
import Offers        from './pages/offers/Offers'
import Reports       from './pages/reports/Reports'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products"  element={<Products />} />
        <Route path="customers" element={<Customers />} />
        <Route path="vendors"   element={<Vendors />} />
        <Route path="orders"    element={<Orders />} />
        <Route path="invoices"  element={<Invoices />} />
        <Route path="payments"  element={<Payments />} />
        <Route path="offers"    element={<Offers />} />
        <Route path="reports"   element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
