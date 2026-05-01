import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, User, Mail, Phone, MapPin, Package, Star, Edit, Send, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage({ user, onBack, setUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [productToReview, setProductToReview] = useState(null);
  
  // review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: productToReview._id, rating, comment }),
      });
      if (res.ok) {
        toast.success("Review posted successfully!");
        setShowReviewModal(false);
        setComment('');
        setRating(5);
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to post review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[80px] lg:pt-[70px] pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12 px-4 lg:px-12 bg-white/5 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="bg-[#050505] rounded-3xl shadow-sm border border-white/5 overflow-hidden">
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-[#009ef7] border-b-2 border-[#009ef7]' : 'text-zinc-600 hover:text-white'}`}
            >
              My Profile
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'orders' ? 'text-[#009ef7] border-b-2 border-[#009ef7]' : 'text-zinc-600 hover:text-white'}`}
            >
              My Orders
            </button>
          </div>

          <div className="p-6 lg:p-10">
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-zinc-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{user.name || 'User'}</h2>
                    <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest mt-2 inline-block">
                      Verified User
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Mobile Number</span>
                    </div>
                    <div className="font-mono font-bold text-sm">{user.phone}</div>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Email Address</span>
                    </div>
                    <div className="font-medium text-sm">{user.email || 'Not provided'}</div>
                  </div>
                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 md:col-span-2">
                    <div className="flex items-center gap-2 text-zinc-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Saved Address</span>
                    </div>
                    <div className="font-medium text-sm">
                      {user.addresses && user.addresses.length > 0 ? (
                        <div>
                          {user.addresses[0].street}, {user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].pincode || user.addresses[0].zipCode}
                        </div>
                      ) : (
                        <div className="text-zinc-600 italic">No saved address yet</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-center">
                  <button 
                    onClick={() => {
                      if (onLogout) onLogout();
                      onBack();
                    }}
                    className="flex items-center gap-2 text-rose-500 hover:text-white hover:bg-rose-500 border border-rose-500 transition-colors uppercase tracking-widest text-xs font-bold px-8 py-3 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {loadingOrders ? (
                  <div className="text-center py-10 text-zinc-600 text-xs uppercase font-bold tracking-widest">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center justify-center">
                    <Package className="w-12 h-12 text-gray-200 mb-4" />
                    <p className="text-zinc-600 uppercase font-bold tracking-widest text-[10px]">No orders found</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order._id} className="border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="font-mono text-xs text-white font-bold">ID: {order.razorpayOrderId || order._id.slice(-8)}</div>
                        </div>
                        <div className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-lg ${
                          order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {order.paymentStatus}
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-4 sm:gap-0">
                            <div className="flex gap-4 items-center">
                              <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden shrink-0">
                                {item.product?.images?.[0] ? (
                                  <img src={item.product.images[0]} alt={item.product?.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-zinc-700" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm uppercase tracking-tight">{item.product?.title || 'Unknown Product'}</h4>
                                <div className="text-xs text-zinc-500 mt-1">Size: {item.size} • Qty: {item.quantity}</div>
                              </div>
                            </div>
                            {order.paymentStatus === 'paid' && item.product && (
                              <button 
                                onClick={() => { setProductToReview(item.product); setShowReviewModal(true); }}
                                className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors w-full sm:w-auto justify-center"
                              >
                                <Edit className="w-3 h-3" /> Add Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {showReviewModal && productToReview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#050505] rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-center mb-6">Review {productToReview.title}</h3>
              <form onSubmit={submitReview} className="space-y-4">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white focus:border-[#009ef7] focus:outline-none transition-colors min-h-[120px]"
                />
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-white text-black px-6 py-4 rounded-xl text-[11px] uppercase font-black tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {reviewLoading ? 'Posting...' : 'Submit Review'}
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
