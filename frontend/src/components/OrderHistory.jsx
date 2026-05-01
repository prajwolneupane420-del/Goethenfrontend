import { motion, AnimatePresence } from 'motion/react';
import { X, Package, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OrderHistory({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-bg/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-dark-bg border-l border-white/5 h-full relative z-10 flex flex-col"
          >
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-bg/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="text-xl font-black uppercase tracking-widest">Your History</div>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">
                  {orders.length} orders
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#050505]/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-[#050505]/5 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#050505]/5 rounded-full flex items-center justify-center mb-4 text-zinc-700">
                    <Package className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">No orders yet</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} className="glass-card rounded-[24px] p-5 border border-white/5 hover:border-accent/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="font-mono text-[10px] text-zinc-600">ID: {order.razorpayOrderId || order._id.slice(-8)}</div>
                      </div>
                      <div className={`text-[8px] uppercase font-black px-2 py-1 rounded-full border ${
                        order.paymentStatus === 'paid' ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'
                      }`}>
                        {order.paymentStatus}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-300 truncate max-w-[200px]">{item.quantity}x {item.size} Edition</span>
                          <span className="text-zinc-500 font-mono italic">#{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {order.orderStatus === 'delivered' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                        )}
                        <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-400">{order.orderStatus}</span>
                      </div>
                      <div className="text-sm font-black text-white font-mono">₹{order.totalAmount}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
