import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Package, MapPin } from 'lucide-react';
import api from '../../api/axios';

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data)
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': 
      case 'processing':
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-8"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-8 w-full"></div>
        <div className="h-64 bg-gray-200 rounded-lg w-full"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          Failed to load order details.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/account/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.status)}`}>
            {order.status || 'pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div className="card overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Items Ordered</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, i) => (
                <div key={i} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.qty} × ₹{item.unitPrice?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="font-semibold text-gray-900 text-lg">
                    ₹{((item.qty * item.unitPrice) || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Summary */}
          <div className="card bg-gray-50 border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{order.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium text-gray-900">₹{order.tax?.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-900 text-lg">Grand Total</span>
                <span className="font-bold text-gray-900 text-xl">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.zip}, {order.shippingAddress?.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
