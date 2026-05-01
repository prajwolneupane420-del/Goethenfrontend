import { motion } from 'motion/react';
import { Package, Clock, CheckCircle2, ChevronLeft, Calendar, Hash, CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrdersPage({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12 px-6 lg:px-12 bg-dark-bg">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 hover:bg-[#050505]/5 rounded-2xl transition-colors border border-white/5"
            >
              <ChevronLeft className="w-5 h-5 text-accent" />
            </button>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-widest text-white flex items-center gap-4">
                Order History
                <span className="text-[10px] not-italic bg-accent/20 text-accent px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                  {orders.length} TOTAL
                </span>
              </h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 glass-card rounded-[40px] animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="glass-card rounded-[40px] p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-[#050505]/5 rounded-full flex items-center justify-center mb-8 text-zinc-700">
              <Package className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-zinc-400">Your vault is empty</h2>
            <p className="text-zinc-600 text-sm max-w-xs mb-8 uppercase tracking-widest leading-relaxed">
              You haven't secured any drops yet. Time to level up your streetwear game.
            </p>
            <button 
              onClick={onBack}
              className="bg-accent text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-xs shadow-neon"
            >
              Shop Collection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[40px] p-8 border border-white/5 hover:border-accent/20 transition-all group overflow-hidden relative"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
                  <div className="md:col-span-4 lg:col-span-3">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                        <Calendar className="w-3 h-3 text-accent" />
                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                        <Hash className="w-3 h-3" />
                        {order.razorpayOrderId ? order.razorpayOrderId.slice(-12) : order._id.slice(-8)}
                      </div>
                      <div className={`w-fit text-[9px] uppercase font-black px-4 py-1.5 rounded-full border flex items-center gap-2 ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-400/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-400/10 border-rose-500/30 text-rose-400'
                      }`}>
                        <CreditCard className="w-3 h-3" />
                        {order.paymentStatus}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 lg:col-span-6 md:border-l border-t md:border-t-0 border-white/5 pt-4 md:pt-0 md:pl-8">
                    <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4">Secured Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          {item.product?.images?.[0] ? (
                            <img src={item.product.images[0]} alt={item.product.title || 'Product'} className="w-12 h-16 object-cover rounded-xl border border-white/10" />
                          ) : (
                            <div className="w-12 h-16 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                              <Package className="w-4 h-4 text-zinc-500" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">
                              {item.product?.title || 'Unknown Product'}
                            </span>
                            <span className="text-[10px] text-zinc-500 uppercase">
                              {item.quantity}x | Size: {item.size || 'N/A'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-between items-start md:items-end md:border-l border-t md:border-t-0 border-white/5 pt-4 md:pt-0 md:pl-8 text-left md:text-right">
                    <div className="flex items-center gap-2 mb-4">
                      {order.orderStatus === 'delivered' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                      )}
                      <span className="text-sm font-black text-white uppercase tracking-widest">{order.orderStatus}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-bold mb-1">Final Amount</span>
                      <div className="text-3xl font-black text-white tracking-tighter">₹{order.totalAmount}</div>
                    </div>
                  </div>
                </div>

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-all" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
