import { Outlet, NavLink, Link } from 'react-router-dom'
import { User, ShoppingBag, FileText, ChevronRight } from 'lucide-react'
import useAuthStore from '../../store/auth.store'

const accountNav = [
  { to: '/account',           label: 'Profile',     icon: User,        end: true },
  { to: '/account/orders',    label: 'My Orders',   icon: ShoppingBag },
  { to: '/account/invoices',  label: 'My Invoices', icon: FileText },
]

export default function AccountLayout() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900">My Account</span>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-0.5">
            {accountNav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
