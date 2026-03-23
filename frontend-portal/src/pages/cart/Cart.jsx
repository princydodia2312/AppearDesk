import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import useCartStore from '../../store/cart.store'
import useAuthStore from '../../store/auth.store'

export default function Cart() {
  const { items, removeItem, updateQty, clearCart } = useCartStore()
  const { token }  = useAuthStore()
  const navigate   = useNavigate()

  const subtotal = items.reduce((sum, i) => sum + i.total, 0)

  const handleCheckout = () => {
    if (!token) return navigate('/login', { state: { from: '/checkout/address' } })
    navigate('/checkout/address')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn-primary px-6">Browse products</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Shopping cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, qty, unitPrice, total }) => (
            <div key={product._id} className="card p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gray-200" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">₹{unitPrice.toLocaleString()}</p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQty(product._id, qty - 1)}
                    className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => updateQty(product._id, qty + 1)}
                    className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(product._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <p className="font-medium text-gray-900">₹{total.toLocaleString()}</p>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
