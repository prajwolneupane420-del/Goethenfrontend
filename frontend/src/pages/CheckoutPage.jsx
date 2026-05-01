import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CheckoutPage({ user, onBack, onCheckoutSuccess }) {
  const { cart, subtotal, shippingFee, discountAmount, total } = useCart();
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddress({
        street: user.addresses[0].street || '',
        city: user.addresses[0].city || '',
        state: user.addresses[0].state || '',
        zipCode: user.addresses[0].pincode || user.addresses[0].zipCode || ''
      });
    }
  }, [user]);

  const placeOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map(item => ({
        product: item.id,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      }));

      // In COD, if total is just standard shipping or 0 logic:
      // If paymentMethod is COD and there's a shipping fee to pay upfront, calculate amountToPay.
      // But actually, we pass totalAmount and amountToPay. 
      // Prepaid = amountToPay is total.
      // COD = amountToPay is shipping fee (79) or 0 if product is 0. 
      // But wait: "if product amount is 0 after applying some special coupon accept the COD order directly"
      let paymentAmount = paymentMethod === 'prepaid' ? total : 79;
      if (paymentMethod === 'cod') {
        const productTotal = subtotal - discountAmount;
        if (productTotal <= 0) {
          paymentAmount = 0; // Accept directly
        }
      }

      console.log('Sending checkout data:', { paymentMethod, paymentAmount, total });

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items,
          totalAmount: total,
          amountToPay: paymentAmount,
          shippingAddress: address,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.directSuccess) {
        onCheckoutSuccess();
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID?.trim(),
        amount: data.rzpOrder.amount,
        currency: data.rzpOrder.currency,
        name: "Ethenstreet",
        description: paymentMethod === 'cod' ? "COD Upfront Shipping Charge" : "Premium Streetwear",
        order_id: data.rzpOrder.id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: data.orderId
            })
          });
          if (verifyRes.ok) {
            onCheckoutSuccess();
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone
        },
        theme: { color: "#009ef7" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert(response.error.description);
      });
      rzp.open();

    } catch (err) {
      alert(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12 px-4 lg:px-12 bg-white/5 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Cart
          </button>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-white">
                <MapPin className="w-5 h-5 text-[#009ef7]" />
                <h2 className="font-black uppercase tracking-widest text-sm">Shipping Address</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Street</label>
                  <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:border-[#009ef7]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">City</label>
                    <input type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:border-[#009ef7]" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">State</label>
                    <input type="text" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:border-[#009ef7]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ZIP Code</label>
                  <input type="text" value={address.zipCode} onChange={(e) => setAddress({...address, zipCode: e.target.value})} className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 mt-1 text-sm outline-none focus:border-[#009ef7]" />
                </div>
              </div>
            </div>

            <div className="bg-[#050505] p-6 rounded-3xl border border-white/5 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#009ef7]" />
                <h2 className="font-black uppercase tracking-widest text-sm">Payment Method</h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'prepaid' ? 'border-[#009ef7] bg-blue-50' : 'border-white/10'}`}>
                  <input type="radio" name="paymentMethod" value="prepaid" checked={paymentMethod === 'prepaid'} onChange={() => setPaymentMethod('prepaid')} className="mt-1" />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                       <CreditCard className="w-4 h-4" /> Prepaid (UPI / Cards)
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase mt-1">Pay securely via Razorpay</div>
                  </div>
                </label>
                <label className={`flex items-start gap-4 p-4 border rounded-2xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#009ef7] bg-blue-50' : 'border-white/10'}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1" />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <Banknote className="w-4 h-4" /> Cash on Delivery
                    </div>
                    {((subtotal - discountAmount) > 0) && (
                      <div className="text-xs text-rose-500 font-bold mt-2 bg-rose-50 p-2 rounded-lg">
                        ₹79 shipping charge must be paid securely via Razorpay now to confirm COD order.
                      </div>
                    )}
                    {((subtotal - discountAmount) <= 0) && (
                       <div className="text-xs text-emerald-500 font-bold mt-2 bg-emerald-50 p-2 rounded-lg">
                        Free directly accepted COD due to special coupon!
                     </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
             <div className="bg-[#050505] p-6 rounded-[32px] border border-white/5 shadow-sm sticky top-28 space-y-6">
               <h3 className="font-black uppercase tracking-widest text-sm mb-4">Order Summary ({cart.length} items)</h3>
               
               <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar border-b border-white/5 pb-4">
                 {cart.map(item => (
                   <div key={item.id+item.size} className="flex gap-4">
                     <img src={item.image} alt={item.title} className="w-16 h-16 rounded-xl object-cover bg-white/5 border border-white/5" />
                     <div>
                       <div className="text-xs font-bold uppercase tracking-tight">{item.title}</div>
                       <div className="text-[10px] text-zinc-500 mt-1 uppercase">QTY: {item.quantity} | Size: {item.size}</div>
                       <div className="font-mono text-sm font-bold mt-1">₹{item.price}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="space-y-3 pb-6 border-b border-white/5">
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
              
              {paymentMethod === 'cod' && (subtotal - discountAmount > 0) && (
                <div className="py-2 flex justify-between items-center bg-blue-50 px-4 rounded-xl text-blue-700">
                  <span className="text-[10px] font-bold uppercase tracking-widest">To pay now</span>
                  <span className="font-mono font-bold text-lg">₹79</span>
                </div>
              )}

               <button 
                 onClick={placeOrder}
                 disabled={loading || !address.street || !address.city || !address.zipCode}
                 className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 hover:bg-gray-200 disabled:opacity-50 transition-colors"
               >
                 {loading ? 'Processing...' : 'Place Order'}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
