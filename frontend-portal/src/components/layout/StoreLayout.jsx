import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../../store/auth.store'
import useCartStore from '../../store/cart.store'

export default function StoreLayout() {
  const { user, token, logout } = useAuthStore()
  const items                   = useCartStore((s) => s.items)
  const cartCount               = items.reduce((sum, i) => sum + i.qty, 0)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate                = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-lg font-semibold text-gray-900">
            MyShop
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/"     end className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Home</NavLink>
            <NavLink to="/shop"     className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Shop</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-gray-900">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gray-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {token ? (
              <div className="flex items-center gap-2">
                <Link to="/account" className="p-2 text-gray-600 hover:text-gray-900">
                  <User size={20} />
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-4 py-1.5">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} MyShop. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
