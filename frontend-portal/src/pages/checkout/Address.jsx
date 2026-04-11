import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import useCartStore from '../../store/cart.store';

export default function Address() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India'
  });

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate('/checkout/payment', { state: { address: formData } });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/cart" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Cart
      </Link>
      
      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Address</span>
          <span className="mx-4 text-gray-300">→</span>
          <span className="text-gray-400 pb-1">Payment</span>
          <span className="mx-4 text-gray-300">→</span>
          <span className="text-gray-400 pb-1">Confirm</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Form */}
        <div className="w-full lg:w-2/3">
          <div className="card p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Delivery Address</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required name="fullName" value={formData.fullName} onChange={handleChange} className="input w-full" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} className="input w-full" placeholder="+91 9876543210" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input required name="street" value={formData.street} onChange={handleChange} className="input w-full" placeholder="123 Main St, Apt 4B" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="input w-full" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input required name="state" value={formData.state} onChange={handleChange} className="input w-full" placeholder="Maharashtra" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input required name="zip" value={formData.zip} onChange={handleChange} className="input w-full" placeholder="400001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input required name="country" value={formData.country} onChange={handleChange} className="input w-full" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-8 flex justify-end">
                <button type="submit" className="btn-primary py-3 px-8 text-lg font-medium rounded-md w-full md:w-auto">
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-1/3">
          <div className="card p-6 md:p-8 bg-gray-50 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={`${item.product._id}-${idx}`} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 line-clamp-1">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold text-gray-900 ml-4">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">Taxes and shipping calculated at checkout</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
