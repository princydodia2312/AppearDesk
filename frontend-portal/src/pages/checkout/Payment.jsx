import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Smartphone, CreditCard, Building2, Banknote, Check } from 'lucide-react';
import api from '../../api/axios';
import useCartStore from '../../store/cart.store';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const address = location.state?.address;
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [errorMsg, setErrorMsg] = useState('');

  if (!address) {
    return <Navigate to="/checkout/address" replace />;
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const orderMutation = useMutation({
    mutationFn: (orderData) => api.post('/orders', orderData).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      clearCart();
      navigate('/checkout/thankyou', { replace: true });
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to place order');
    }
  });

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    
    orderMutation.mutate({
      items: items.map(i => ({ product: i.product._id, qty: i.qty })),
      shippingAddress: address,
      notes: `Payment Method: ${paymentMethod}`
    });
  };

  const methods = [
    { id: 'UPI', icon: <Smartphone className="h-6 w-6" />, title: 'UPI', desc: 'Pay via UPI / Google Pay / PhonePe' },
    { id: 'CARD', icon: <CreditCard className="h-6 w-6" />, title: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'BANK', icon: <Building2 className="h-6 w-6" />, title: 'Bank Transfer', desc: 'NEFT / RTGS / IMPS' },
    { id: 'COD', icon: <Banknote className="h-6 w-6" />, title: 'Cash on Delivery', desc: 'Pay when delivered' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-center mb-10">
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-400 border-b-2 border-transparent pb-1">Address</span>
          <span className="mx-4 text-gray-300">→</span>
          <span className="text-gray-900 border-b-2 border-gray-900 pb-1">Payment</span>
          <span className="mx-4 text-gray-300">→</span>
          <span className="text-gray-400 pb-1">Confirm</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Payment Selection */}
        <div className="w-full lg:w-2/3">
          <div className="card p-6 md:p-8">
            <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
            <div className="space-y-4">
              {methods.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === m.id 
                      ? 'border-gray-900 bg-gray-50 shadow-sm' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`p-3 rounded-full mr-4 ${paymentMethod === m.id ? 'bg-white text-gray-900 shadow-sm' : 'bg-gray-100 text-gray-500'}`}>
                    {m.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{m.title}</h3>
                    <p className="text-sm text-gray-500">{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && (
                    <div className="absolute right-4 text-gray-900">
                      <Check className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-lg font-medium mb-2">Shipping To</h3>
              <p className="text-gray-600 text-sm">{address.fullName}, {address.phone}</p>
              <p className="text-gray-600 text-sm">{address.street}, {address.city}, {address.state} {address.zip}, {address.country}</p>
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div className="w-full lg:w-1/3">
          <div className="card p-6 md:p-8 bg-gray-50 border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Items ({items.length})</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                {errorMsg}
              </div>
            )}

            <button 
              onClick={handlePlaceOrder}
              disabled={orderMutation.isPending || items.length === 0}
              className={`btn-primary w-full py-4 rounded-md text-lg font-medium flex items-center justify-center ${orderMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {orderMutation.isPending ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
