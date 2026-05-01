import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const applyCoupon = async (code) => {
    try {
      const res = await fetch(`/api/coupons/code/${code}`);
      if (!res.ok) {
        throw new Error('Invalid coupon code');
      }
      const data = await res.json();
      setCoupon(data);
      toast.success(`Coupon ${code.toUpperCase()} applied!`);
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.success('Coupon removed');
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.size === item.size) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
    toast.success('Added to cart successfully', { icon: '🛍️' });
  };

  const removeFromCart = (id, size) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
  };

  const updateQuantity = (id, size, q) => {
    setCart(prev => prev.map(i => (i.id === id && i.size === size) ? { ...i, quantity: Math.max(1, q) } : i));
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  let shippingFee = cart.length > 0 ? 79 : 0; // Fix shipping fee, Rs. 79 mandatory 

  if (coupon && subtotal >= coupon.minOrderValue && cart.length > 0) {
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discount) / 100;
    } else {
      discountAmount = coupon.discount;
    }
    discountAmount = Math.min(subtotal, discountAmount);
    
    if (coupon.freeShipping) {
      shippingFee = 0;
    }
  } else if (coupon && subtotal < coupon.minOrderValue) {
    // Optionally remove coupon or keep it but don't apply discount
    discountAmount = 0;
  }

  const total = subtotal + shippingFee - discountAmount;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      subtotal, 
      shippingFee, 
      discountAmount, 
      total, 
      coupon, 
      applyCoupon, 
      removeCoupon 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
