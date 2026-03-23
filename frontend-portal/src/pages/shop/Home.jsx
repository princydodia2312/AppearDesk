import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-semibold text-gray-900 tracking-tight mb-6">
          Welcome to MyShop
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
          Browse our collection of products and get the best deals delivered to your door.
        </p>
        <Link to="/shop" className="btn-primary px-8 py-3 text-base gap-2">
          Shop now <ArrowRight size={18} />
        </Link>
      </section>

      {/* Featured section placeholder */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="bg-gray-100 rounded-lg h-48 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
        {/* TODO (P4): fetch and display real featured products */}
      </section>
    </div>
  )
}
