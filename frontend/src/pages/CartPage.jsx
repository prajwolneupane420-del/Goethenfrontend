import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Tag, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartPage({ onBack, onProceedCheckout }) {
  const { cart, removeFromCart, updateQuantity, subtotal, shippingFee, discountAmount, total, coupon, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const success = await applyCoupon(couponCode);
    if (!success) {
      setCouponError('WRONG COUPON');
    } else {
      setCouponCode('');
    }
    setIsApplying(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12 px-4 lg:px-12 bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto">
        <div className="py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Shopping
          </button>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[32px] border border-white/5">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mb-6" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-zinc-600 mb-4">Cart is Empty</h2>
            <button 
              onClick={onBack}
              className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#050505] shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm uppercase tracking-tight">{item.title}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-zinc-600 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
                        Size: {item.size}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4 bg-[#050505] rounded-xl border border-white/10 px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-1 hover:text-[#009ef7]"><Minus className="w-4 h-4" /></button>
                        <span className="font-mono text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-1 hover:text-[#009ef7]"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="font-mono font-bold text-white">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 h-fit space-y-6">
              <h3 className="font-black uppercase tracking-widest text-sm mb-4">Order Summary</h3>

              <div className="pb-6 border-b border-white/10">
                {coupon ? (
                  <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                       <Tag className="w-4 h-4 text-emerald-500" />
                       <div>
                         <span className="font-bold text-emerald-600 text-xs">{coupon.code}</span>
                         {coupon.minOrderValue > subtotal && (
                           <span className="text-[10px] text-red-500 font-bold block">Add ₹{coupon.minOrderValue - subtotal} more</span>
                         )}
                       </div>
                    </div>
                    <button onClick={removeCoupon} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase">Remove</button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          if (couponError) setCouponError('');
                        }}
                        className={`flex-1 bg-[#050505] border ${couponError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-white/50'} rounded-xl px-4 py-3 text-xs font-mono uppercase outline-none transition-colors`}
                      />
                      <button 
                        type="submit"
                        disabled={isApplying || !couponCode.trim()}
                        className="bg-white text-black px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </form>
                    {couponError && (
                      <div className="text-[10px] font-bold uppercase text-red-500 tracking-widest mt-2 px-1">
                        {couponError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 pb-6 border-b border-white/10">
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase tracking-widest">
                    <span>Discount</span>
                    <span className="font-mono">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="font-mono text-white">{shippingFee === 0 ? <span className="text-emerald-500">FREE</span> : `₹${shippingFee}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="font-black uppercase tracking-widest text-sm">Total</span>
                <span className="text-2xl font-black font-mono text-[#009ef7]">₹{total}</span>
              </div>

              <button 
                onClick={onProceedCheckout}
                className="w-full bg-[#009ef7] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-[#008be5] transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
