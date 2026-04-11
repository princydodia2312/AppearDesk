import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Minus, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cart.store';

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then(r => r.data)
  });

  const product = data;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, qty);
      navigate('/cart');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="w-24 h-6 bg-gray-200 rounded mb-8"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded w-full mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          Failed to load product. {error?.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/shop" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Shop
      </Link>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="h-20 w-20 text-gray-300" />
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center">
          {product.category && (
            <span className="inline-block bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full w-max mb-4">
              {product.category}
            </span>
          )}
          
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4 tracking-tight">
            {product.name}
          </h1>
          
          <p className="text-3xl font-bold text-gray-900 mb-6">
            ₹{product.price?.toLocaleString('en-IN')}
          </p>

          <div className="prose prose-sm text-gray-600 mb-8">
            <p>{product.description}</p>
          </div>

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                In stock {product.stock < 10 ? `(Only ${product.stock} left!)` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                Out of stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-end gap-4 mt-auto border-t border-gray-100 pt-8">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 text-center font-medium text-gray-900">
                    {qty}
                  </div>
                  <button 
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn-primary flex-grow h-[46px] rounded-md text-lg font-medium shadow-sm"
              >
                Add to cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
