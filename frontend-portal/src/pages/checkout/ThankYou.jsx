import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import useCartStore from '../../store/cart.store'

export default function ThankYou() {
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">Thank you for your order!</h1>
        <p className="text-gray-500 mb-8">
          Your order has been placed successfully. You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account/orders" className="btn-primary px-6">View my orders</Link>
          <Link to="/shop" className="btn-outline px-6">Continue shopping</Link>
        </div>
      </div>
    </div>
  )
}
