import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/auth.store'

// Layout
import StoreLayout from './components/layout/StoreLayout'
import AccountLayout from './components/layout/AccountLayout'

// Public pages
import Home       from './pages/shop/Home'
import Shop       from './pages/shop/Shop'
import Product    from './pages/shop/Product'
import Cart       from './pages/cart/Cart'
import Login      from './pages/auth/Login'
import Register   from './pages/auth/Register'

// Checkout pages
import Address    from './pages/checkout/Address'
import Payment    from './pages/checkout/Payment'
import ThankYou   from './pages/checkout/ThankYou'

// Account pages
import Profile    from './pages/account/Profile'
import MyOrders   from './pages/account/MyOrders'
import OrderDetail from './pages/account/OrderDetail'
import MyInvoices from './pages/account/MyInvoices'
import InvoiceDetail from './pages/account/InvoiceDetail'
import ChatWidget    from './components/ChatWidget'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
    <Routes>
      {/* Public routes with store layout (header + footer) */}
      <Route element={<StoreLayout />}>
        <Route path="/"        element={<Home />} />
        <Route path="/shop"    element={<Shop />} />
        <Route path="/shop/:id" element={<Product />} />
        <Route path="/cart"    element={<Cart />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Checkout — protected, no footer distraction */}
      <Route path="/checkout">
        <Route path="address" element={<ProtectedRoute><Address /></ProtectedRoute>} />
        <Route path="payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="thankyou" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
      </Route>

      {/* My Account — protected, with account sidebar layout */}
      <Route
        path="/account"
        element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}
      >
        <Route index          element={<Profile />} />
        <Route path="orders"  element={<MyOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="invoices"   element={<MyInvoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ChatWidget />
    </>
  )
}
