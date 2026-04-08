import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingBag } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cart.store';

export default function Shop() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedProductId, setAddedProductId] = useState(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, selectedCategory],
    queryFn: () => 
      api.get('/products', {
        params: {
          search: searchTerm || undefined,
          category: selectedCategory === 'All' ? undefined : selectedCategory
        }
      }).then(r => r.data)
  });

  const products = data?.data || [];
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addItem(product, 1);
    setAddedProductId(product._id);
    setTimeout(() => {
      setAddedProductId(null);
    }, 1000);
  };

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          Failed to load products. {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 max-w-xl mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {!isLoading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-0 overflow-hidden border border-gray-100 shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200 w-full"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or category filter.</p>
          {(searchTerm !== '' || selectedCategory !== 'All') && (
            <button 
              onClick={() => {
                setSearchInput('');
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="btn-outline px-4 py-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div 
              key={product._id} 
              className="card p-0 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
              onClick={() => navigate(`/shop/${product._id}`)}
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {product.category && (
                  <span className="absolute top-2 left-2 z-10 bg-gray-900/10 backdrop-blur-md text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {product.category}
                  </span>
                )}
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-gray-900">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className={`mt-4 w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    addedProductId === product._id
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'btn-primary'
                  }`}
                  disabled={!product.isActive || product.stock === 0}
                >
                  {addedProductId === product._id ? 'Added!' : (product.stock === 0 ? 'Out of stock' : 'Add to cart')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
