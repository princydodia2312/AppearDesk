import React from 'react';
import { ShoppingCart, Users, FileText, IndianRupee, Package, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../api/axios';

export default function Dashboard() {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => api.get('/reports/summary').then(res => res.data)
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['reports', 'monthly'],
    queryFn: () => api.get('/reports/monthly').then(res => res.data)
  });

  const s = summaryData || {};
  const maxRevenue = monthlyData?.length > 0 ? Math.max(...monthlyData.map(m => m.revenue || 0)) : 0;

  const stats = [
    { label: 'Total Revenue', value: s.totalRevenue ? `₹${s.totalRevenue.toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Orders', value: s.totalOrders || 0, icon: ShoppingCart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Total Customers', value: s.totalCustomers || 0, icon: Users, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Pending Invoices', value: s.pendingInvoices || 0, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Active Vendors', value: s.totalVendors || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: s.pendingOrders || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Low Stock Products', value: s.lowStockProducts || 0, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-mesh min-h-[calc(100vh-64px)] rounded-3xl mt-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <p className="text-slate-500 mt-2">Welcome back. Here is the latest data for your business.</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div key={label} variants={item} className="glass-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-3xl font-extrabold text-slate-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:bg-indigo-100 transition-colors`}></div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Monthly Revenue Chart */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="text-indigo-500" /> Monthly Revenue</h3>
        {monthlyData && monthlyData.length > 0 ? (
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-10">
            {monthlyData.map((month, i) => {
              const heightPercentage = maxRevenue > 0 ? Math.max((month.revenue / maxRevenue) * 100, 5) : 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                   {/* Tooltip */}
                   <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
                     ₹{(month.revenue || 0).toLocaleString('en-IN')}
                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
                   </div>
                   
                   {/* Bar */}
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${heightPercentage}%` }}
                     transition={{ duration: 1, type: "spring", delay: i * 0.05 }}
                     className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-md relative overflow-hidden group-hover:from-indigo-400 group-hover:to-violet-300 transition-colors shadow-sm"
                   >
                     <div className="absolute top-0 left-0 w-full h-full bg-white/20 blur-[1px] translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                   </motion.div>
                   <span className="text-xs font-medium text-slate-500 mt-3 -rotate-45 sm:rotate-0 origin-left whitespace-nowrap">{month.month || (month._id ? `${month._id.month}/${month._id.year}` : `Month ${i + 1}`)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400">
             No revenue data available for recent months.
          </div>
        )}
      </motion.div>
    </div>
  );
}
