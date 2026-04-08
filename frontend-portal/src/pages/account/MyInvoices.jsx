import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import api from '../../api/axios';

export default function MyInvoices() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(r => r.data)
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': 
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load invoices.
        </div>
      </div>
    );
  }

  const invoices = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Invoices</h1>

      {isLoading ? (
        <div className="card overflow-hidden">
          <div className="animate-pulse flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 p-6 flex gap-6">
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
                <div className="h-4 bg-gray-200 rounded w-1/5"></div>
              </div>
            ))}
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 card">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-500">When you place an order, invoices will appear here.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-700 uppercase font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Invoice No.</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Total (₹)</th>
                  <th className="px-6 py-4 text-right">Paid (₹)</th>
                  <th className="px-6 py-4 text-right">Balance Due (₹)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice) => (
                  <tr 
                    key={invoice._id} 
                    onClick={() => navigate(`/account/invoices/${invoice._id}`)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber || invoice._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right font-medium">₹{invoice.total?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-green-600">₹{invoice.amountPaid?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right font-medium">
                      <span className={invoice.balanceDue > 0 ? 'text-red-600' : 'text-gray-900'}>
                        ₹{invoice.balanceDue?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                        {invoice.status || 'draft'}
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
