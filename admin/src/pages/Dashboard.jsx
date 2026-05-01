import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, Users, Package, ShoppingCart, 
  ArrowLeft, RefreshCw, CheckCircle, Truck, XCircle, Tag, Image as ImageIcon, Download
} from 'lucide-react';
import ProductManager from './ProductManager';
import CouponManager from './CouponManager';
import BannerManager from './BannerManager';

export default function Dashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.orderStatus === orderFilter);
  }, [orders, orderFilter]);

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchOrders();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'SKUID', 'Product Name', 'Size', 'Status', 'Shipping Address', 'Customer Name'];
    const rows = [];
    filteredOrders.forEach(order => {
      const address = order.shippingAddress 
        ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.zipCode || order.shippingAddress.pincode || ''}`
        : 'N/A';
        
      if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
          const skuId = item.product?.skuId || item.product?._id || 'N/A';
          const productName = item.product?.title || 'Unknown Product';
          const size = item.size || 'N/A';
          const costumerName = order.user?.name || 'Unknown';
          const orderStatus = order.orderStatus || 'N/A';
          
          rows.push([
            `"${order._id}"`,
            `"${skuId}"`,
            `"${productName.replace(/"/g, '""')}"`,
            `"${size}"`,
            `"${orderStatus}"`,
            `"${address.replace(/"/g, '""')}"`,
            `"${costumerName.replace(/"/g, '""')}"`
          ]);
        });
      } else {
        // Fallback for orders without items
        const costumerName = order.user?.name || 'Unknown';
        const orderStatus = order.orderStatus || 'N/A';
        rows.push([
          `"${order._id}"`,
          '"N/A"',
          '"No Items"',
          '"N/A"',
          `"${orderStatus}"`,
          `"${address.replace(/"/g, '""')}"`,
          `"${costumerName.replace(/"/g, '""')}"`
        ]);
      }
    });

    const csvContent = "\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-accent animate-pulse uppercase tracking-[0.4em] font-black italic">Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-dark-bg p-6 lg:p-12">
      <nav className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-12">
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-xl md:text-2xl font-black tracking-tighter uppercase">
            ADMIN<span className="text-accent underline">CONTROL</span>
          </div>
        </div>
        
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5 w-fit flex-wrap gap-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'overview' ? 'bg-accent text-white' : 'hover:text-white text-zinc-500'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'products' ? 'bg-accent text-white' : 'hover:text-white text-zinc-500'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'coupons' ? 'bg-accent text-white' : 'hover:text-white text-zinc-500'}`}
          >
            Coupons
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'banners' ? 'bg-accent text-white' : 'hover:text-white text-zinc-500'}`}
          >
            Banners
          </button>
        </div>
      </nav>

      {activeTab === 'products' ? (
        <ProductManager />
      ) : activeTab === 'coupons' ? (
        <CouponManager />
      ) : activeTab === 'banners' ? (
        <BannerManager />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 lg:gap-6 mb-12 overflow-x-auto min-w-full">
            {[
              { label: 'Total Revenue', value: `₹${stats?.revenue?.toLocaleString()}`, icon: BarChart3, color: 'text-emerald-400' },
          { label: 'Active Orders', value: stats?.orders, icon: ShoppingCart, color: 'text-accent' },
          { label: 'Catalog Size', value: stats?.products, icon: Package, color: 'text-blue-400' },
          { label: 'Registered Users', value: stats?.users, icon: Users, color: 'text-purple-400' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-[32px] p-4 sm:p-6 lg:p-8 flex flex-col justify-between"
          >
            <div className={`p-3 lg:p-4 bg-white/5 rounded-2xl w-fit ${item.color}`}>
              <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="mt-6 lg:mt-8">
              <div className="text-zinc-500 text-[9px] lg:text-[10px] uppercase font-bold tracking-widest lg:tracking-[0.2em] mb-1 lg:mb-2">{item.label}</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter">{item.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest italic">Live Order Stream</h3>
            <div className="flex gap-2 items-center">
              <select 
                value={orderFilter}
                onChange={e => setOrderFilter(e.target.value)}
                className="bg-transparent border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-300 focus:border-accent outline-none"
              >
                <option value="all" className="bg-[#050505]">All Orders</option>
                <option value="processing" className="bg-[#050505]">Processing</option>
                <option value="shipped" className="bg-[#050505]">Shipped</option>
                <option value="delivered" className="bg-[#050505]">Delivered</option>
                <option value="cancelled" className="bg-[#050505]">Cancelled</option>
              </select>
              <button onClick={handleExportCSV} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Download className="w-4 h-4 text-zinc-500" /></button>
              <button onClick={fetchOrders} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RefreshCw className="w-4 h-4 text-zinc-500" /></button>
            </div>
          </div>
          <div className="overflow-x-auto w-full max-w-[100vw]">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-zinc-600 border-b border-white/5">
                  <th className="px-8 py-4 font-black">Order ID</th>
                  <th className="px-8 py-4 font-black">Customer & Address</th>
                  <th className="px-8 py-4 font-black">Items</th>
                  <th className="px-8 py-4 font-black">Amount</th>
                  <th className="px-8 py-4 font-black">Status</th>
                  <th className="px-8 py-4 font-black">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 font-mono text-zinc-400 text-xs">{order._id.toString()}</td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-bold uppercase tracking-tight">{order.user?.name}</div>
                      <div className="text-[10px] text-zinc-500">{order.user?.email}</div>
                      {order.shippingAddress && (
                        <div className="text-[10px] text-zinc-400 mt-1.5 leading-relaxed max-w-[200px]">
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        {order.items?.map((item, idx) => (
                           <div key={idx} className="text-[10px] bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
                             <span className="font-bold text-white block line-clamp-1">{item.product?.title || 'Unknown Product'}</span>
                             <div className="text-zinc-500 flex gap-3 mt-1">
                               <span>Qty: {item.quantity}</span>
                               <span className="text-accent font-bold">Size: {item.size || 'N/A'}</span>
                             </div>
                           </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono font-bold text-accent">₹{order.totalAmount}</td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${
                        order.orderStatus === 'delivered' ? 'border-emerald-500/50 text-emerald-400' : 
                        order.orderStatus === 'cancelled' ? 'border-rose-500/50 text-rose-400' : 
                        'border-blue-500/50 text-blue-400'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => updateOrderStatus(order._id, 'shipped')} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all" title="Mark Shipped"><Truck className="w-4 h-4" /></button>
                        <button onClick={() => updateOrderStatus(order._id, 'delivered')} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all" title="Mark Delivered"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => updateOrderStatus(order._id, 'cancelled')} className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all" title="Cancel Order"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
