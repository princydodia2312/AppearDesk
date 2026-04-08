import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

export default function MyOrders() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(r => r.data)
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

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load orders.
        </div>
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="card overflow-hidden">
          <div className="animate-pulse flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 p-6 flex gap-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            Start shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Order No.</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Items</th>
                  <th className="px-6 py-4">Total (₹)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => navigate(`/account/orders/${order._id}`)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber || order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 text-right pr-6">₹{order.total?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
