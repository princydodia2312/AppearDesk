import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, FileText, Download } from 'lucide-react';
import api from '../../api/axios';

export default function InvoiceDetail() {
  const { id } = useParams();

  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`).then(r => r.data)
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 w-24 bg-gray-200 rounded mb-8"></div>
        <div className="h-32 bg-gray-200 rounded-lg mb-8 w-full"></div>
        <div className="h-96 bg-gray-200 rounded-lg w-full"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          Failed to load invoice details.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/account/invoices" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Invoices
      </Link>

      <div className="card overflow-hidden">
        {/* Invoice Header */}
        <div className="p-6 md:p-8 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Invoice #{invoice.invoiceNumber || invoice._id.slice(-8).toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(invoice.status)}`}>
                  {invoice.status || 'draft'}
                </span>
              </div>
            </div>
          </div>
          
          <button className="btn-outline inline-flex items-center gap-2 self-start md:self-auto">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>

        {/* Invoice Dates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 md:p-8 border-b border-gray-100 bg-white">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Invoice Date</p>
            <p className="font-medium text-gray-900">{new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Due Date</p>
            <p className="font-medium text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2 md:text-right">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">₹{invoice.total?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-6 md:p-8">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap mb-8">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Description</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-4 font-medium text-gray-900">{item.description || 'Item'}</td>
                    <td className="px-4 py-4 text-center">{item.qty}</td>
                    <td className="px-4 py-4 text-right">₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">₹{((item.qty * item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-1/3 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">₹{invoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST)</span>
                <span className="font-medium text-gray-900">₹{invoice.tax?.toLocaleString('en-IN')}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span className="font-medium text-green-600">-₹{invoice.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{invoice.total?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-2">
                <span>Amount Paid</span>
                <span className="font-medium text-green-600">₹{invoice.amountPaid?.toLocaleString('en-IN')}</span>
              </div>
              <div className={`flex justify-between font-bold text-lg pt-3 border-t border-gray-200 ${invoice.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                <span>Balance Due</span>
                <span>₹{invoice.balanceDue?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
