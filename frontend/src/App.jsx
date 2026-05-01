import { Toaster } from 'react-hot-toast';
import { Search, ShoppingBag, User as UserIcon, LogOut, ChevronRight, Heart, Menu, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useMemo } from 'react';
import ProductCard from './components/ProductCard.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import WishlistDrawer from './components/WishlistDrawer.jsx';
import OrderHistory from './components/OrderHistory.jsx';
import ProductPage from './pages/ProductPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { useCart } from './context/CartContext.jsx';
import Dashboard from '../../admin/src/pages/Dashboard.jsx';

const MARQUEE_TEXTS = [
  "20% OFF + FREE SHIP (CODE FIRST20)",
  "WELCOME TO ETHENSTREET",
  "SALE IS LIVEE!!!!",
  "HURRY, LIMITED STOCK AVAILABLE!",
  "NEW TRENDING DESIGNS JUST DROPPED"
];

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAuthView, setIsAuthView] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartView, setIsCartView] = useState(false);
  const [isCheckoutView, setIsCheckoutView] = useState(false);
  const [isThankYouView, setIsThankYouView] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isProfileView, setIsProfileView] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isOrdersView, setIsOrdersView] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);
  const [bannerTitle, setBannerTitle] = useState('SUPREME');
  const [bannerSubtitle, setBannerSubtitle] = useState('Edition');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [marqueeIndex, setMarqueeIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('new');
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPriceFilter, setMaxPriceFilter] = useState(null);

  const PRODUCTS_PER_PAGE = 24;

  useEffect(() => {
    setCurrentPage(1);
    setMaxPriceFilter(null);
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, maxPriceFilter]);

  const { cart, total, clearCart } = useCart();

  useEffect(() => {
    // Top marquee animation
    const marqueeTimer = setInterval(() => {
      setMarqueeIndex(prev => (prev + 1) % MARQUEE_TEXTS.length);
    }, 5000);
    return () => clearInterval(marqueeTimer);
  }, []);

  useEffect(() => {
    // Banner carousel animation
    if (bannerImages.length > 1) {
      const bannerTimer = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % bannerImages.length);
      }, 4000);
      return () => clearInterval(bannerTimer);
    }
  }, [bannerImages]);

  useEffect(() => {
    const handleOpenCart = () => setIsCartView(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const res = await fetch(`/api/products/suggestions?q=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
          }
        } catch (err) {
          console.error(err);
        }
      };
      const timeoutId = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isAdminView && !isOrdersView) {
      const delayDebounce = setTimeout(() => {
        fetchProducts();
      }, 500);

      checkAuth();
      loadRazorpay();
      fetchBanner();

      return () => clearTimeout(delayDebounce);
    }
  }, [activeCategory, isAdminView, searchQuery]);

  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/admin/banner');
      if (res.ok) {
        const data = await res.json();
        if (data && data.images && data.images.length > 0) {
          setBannerImages(data.images);
        } else {
          setBannerImages(['https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2574&auto=format&fit=crop']);
        }
        if (data && data.title) setBannerTitle(data.title);
        if (data && data.subtitle) setBannerSubtitle(data.subtitle);
      }
    } catch (err) {
      console.error(err);
      setBannerImages(['https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2574&auto=format&fit=crop']);
    }
  };

  const loadRazorpay = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthView(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(i => ({ product: i.id, quantity: i.quantity, size: i.size, price: i.price })),
          totalAmount: total,
          shippingAddress: { label: 'Default', street: '123 Street', city: 'Bengaluru', pincode: '560001' }
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Error creating order. Please try again.');
        return;
      }

      if (!data.rzpOrder) {
        console.error('No Razorpay order returned from backend', data);
        alert('Payment gateway initialization failed. Please try again.');
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID?.trim(),
        amount: data.rzpOrder.amount,
        currency: data.rzpOrder.currency,
        name: "Ethenstreet",
        description: "Premium Streetwear",
        order_id: data.rzpOrder.id,
        handler: async (response) => {
          const token = localStorage.getItem('token');
          const verifyRes = await fetch('/api/orders/verify', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...response, orderId: data.orderId })
          });
          if (verifyRes.ok) {
            alert('Order Placed Successfully!');
            clearCart();
            setIsCartView(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ""
        },
        theme: { color: "#F43F5E" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setDbError(null);
    try {
      let url = activeCategory === 'All' ? '/api/products' : `/api/products?category=${activeCategory}`;
      if (searchQuery) {
        url += (url.includes('?') ? '&' : '?') + `search=${searchQuery}`;
      }
      const res = await fetch(url);
      
      if (!res.ok) {
        const text = await res.text();
        if (text.startsWith('<!doctype')) {
           setDbError("API Route not found or Server Error. Check server logs.");
        } else {
           setDbError(`Server Error: ${res.status}`);
        }
        setProducts([]);
        return;
      }

      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        if (token) localStorage.removeItem('token');
        return;
      }

      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // If token is invalid, clear it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Check auth error:', err);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('token');
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null);
  };

  const filteredAndSortedProducts = useMemo(() => {
    return [...products]
      .filter(p => maxPriceFilter === null || p.basePrice <= maxPriceFilter)
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
        if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
        return 0;
      });
  }, [products, maxPriceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-accent selection:text-white font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#000', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', fontWeight: 'bold' } }} />
      {/* Navigation */}
      <div className="fixed top-0 w-full z-[80] bg-[#050505] border-b border-white/10">
        <div className="bg-[#009ef7] text-white overflow-hidden py-2 w-full flex items-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={marqueeIndex}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-xs font-bold w-full text-center absolute uppercase tracking-widest"
            >
               {MARQUEE_TEXTS[marqueeIndex]}
            </motion.div>
          </AnimatePresence>
          {/* Invisible placeholder to keep height consistent */}
          <div className="text-xs font-bold w-full text-center opacity-0 uppercase">PLACEHOLDER</div>
        </div>
        <div className="flex justify-between items-center px-4 py-2 lg:px-12 w-full lg:py-3 relative">
          <div className="flex items-center gap-4">
            <button className="p-1 lg:hidden text-white hover:bg-white/10 rounded" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="text-xl lg:text-3xl font-extrabold tracking-tighter cursor-pointer flex gap-1 uppercase" onClick={() => { setActiveCategory('All'); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setShowSearch(false); setSelectedProduct(null); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); window.scrollTo(0, 0); }}>
              <span className="text-white">ETHEN</span>
              <span className="text-[#009ef7]">STREET</span>
            </div>
            
            <div className="hidden lg:flex space-x-8 text-[11px] font-bold text-gray-600 ml-8">
              {['All', 'Anime', 'Superhero', 'Limited'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`${activeCategory === cat ? 'text-white' : 'hover:text-white'} transition-colors uppercase`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2 lg:space-x-4 items-center">
            {/* Desktop Search */}
            <div className="relative group hidden lg:block">
              <div className="relative border border-white/10 rounded-lg bg-white/5 overflow-visible transition-all focus-within:border-[#009ef7] focus-within:ring-2 focus-within:ring-[#009ef7] focus-within:ring-opacity-20">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text" 
                  placeholder="Search Drops..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-64 bg-transparent outline-none pl-10 pr-4 py-2 text-xs font-bold text-white placeholder:text-zinc-600"
                />
                
                <AnimatePresence>
                  {searchQuery && suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#050505] border border-white/10 rounded-lg overflow-hidden z-[100] shadow-xl"
                    >
                      {suggestions.map((suggestion) => (
                        <div 
                          key={suggestion._id}
                          onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                            setSelectedProduct(suggestion);
                          }}
                          className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                        >
                          <img src={suggestion.images[0]} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="text-[10px] font-bold text-white uppercase">{suggestion.title}</div>
                            <div className="text-[8px] text-zinc-500 uppercase">{suggestion.category}</div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Search Button */}
            <button 
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors lg:hidden text-white"
            >
              <Search className="w-5 h-5" />
            </button>

            <button onClick={() => setIsWishlistOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors hidden lg:block text-white">
              <Heart className="w-5 h-5" />
            </button>

            <button onClick={() => { setIsCartView(true); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setSelectedProduct(null); setIsCheckoutView(false); setIsThankYouView(false); window.scrollTo(0,0); }} className="relative cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors text-white">
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 bg-[#009ef7] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <div className="hidden lg:block relative group">
              <button 
                onClick={() => user ? setIsProfileMenuOpen(!isProfileMenuOpen) : setIsAuthView(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-white"
              >
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden md:block text-[10px] uppercase font-bold text-gray-600">
                      {user.name}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#009ef7] text-white flex items-center justify-center text-xs font-black">
                      {user.name[0]}
                    </div>
                  </div>
                ) : (
                  <UserIcon className="w-5 h-5 text-white" />
                )}
              </button>
              
              {user && (
                <div className={`absolute right-0 mt-2 w-48 bg-[#050505] border border-white/10 rounded-xl shadow-xl transition-all transform z-[90] p-2
                  ${isProfileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}
                `}>
                  <button 
                    onClick={() => { setIsProfileView(true); setIsOrdersView(false); setIsAdminView(false); setIsProfileMenuOpen(false); setSelectedProduct(null); }}
                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-xs uppercase font-bold flex items-center justify-between text-white"
                  >
                    My Profile <ChevronRight className="w-3 h-3 text-white" />
                  </button>
                  <button 
                    onClick={() => { setIsWishlistOpen(true); setIsProfileMenuOpen(false); }}
                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-xs uppercase font-bold flex items-center justify-between text-white"
                  >
                    Wishlist <ChevronRight className="w-3 h-3 text-white" />
                  </button>
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => { setIsAdminView(true); setIsProfileMenuOpen(false); }}
                      className="w-full text-left p-3 hover:bg-indigo-50 text-indigo-600 rounded-lg text-xs uppercase font-bold flex items-center justify-between mt-1"
                    >
                      Control Panel <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button 
                    onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }}
                    className="w-full text-left p-3 hover:bg-white/5 rounded-lg text-xs uppercase font-bold flex items-center justify-between mt-1 text-white"
                  >
                    Logout <LogOut className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Overlay */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="absolute inset-0 bg-[#050505] z-[90] flex items-center px-4 gap-3 lg:hidden"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    placeholder="Search Drops..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#009ef7] transition-all placeholder:text-zinc-600"
                    autoFocus
                  />
                  {searchQuery && suggestions.length > 0 && (
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-[#050505] border border-white/10 rounded-lg overflow-hidden shadow-xl" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion._id}
                          onClick={() => {
                            setSearchQuery('');
                            setSuggestions([]);
                            setShowSearch(false);
                            setSelectedProduct(suggestion);
                          }}
                          className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 border-b border-white/5 last:border-0"
                        >
                          <img src={suggestion.images[0]} className="w-8 h-8 rounded-lg object-cover" />
                          <div>
                            <div className="text-[10px] font-bold text-white uppercase">{suggestion.title}</div>
                            <div className="text-[8px] text-zinc-500 uppercase">{suggestion.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); setSuggestions([]); }} className="p-2 text-white hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[90] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#050505] z-[100] p-6 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="text-xl font-extrabold tracking-tighter uppercase cursor-pointer" onClick={() => { setActiveCategory('All'); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setShowSearch(false); setSelectedProduct(null); setIsMobileMenuOpen(false); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); window.scrollTo(0, 0); }}>
                  <span className="text-white">ETHEN</span>
                  <span className="text-[#009ef7]">STREET</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Categories</div>
                {['All', 'Anime', 'Superhero', 'Limited'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { setActiveCategory(cat); setIsMobileMenuOpen(false); }}
                    className={`text-left text-sm uppercase font-bold py-2 border-b border-white/5 ${activeCategory === cat ? 'text-[#009ef7]' : 'text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {user && user.role === 'admin' && (
                <button 
                  onClick={() => { setIsAdminView(true); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-lg text-xs uppercase font-bold text-center mt-6"
                >
                  Admin Panel
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {!selectedProduct && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#050505] border-t border-white/10 px-4 pt-1.5 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center max-w-md mx-auto overflow-x-auto gap-3 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { id: 'Home', icon: Search, label: 'Explore', active: activeCategory === 'All' },
              ...(user && user.role === 'admin' ? [{ id: 'Admin', icon: UserIcon, label: 'Admin', active: isAdminView }] : []),
              { id: 'Profile', icon: UserIcon, label: 'Profile', active: isProfileView },
              { id: 'Wishlist', icon: Heart, label: 'Wishlist', active: isWishlistOpen },
              { id: 'Bag', icon: ShoppingBag, label: 'Bag', count: cart.length, active: isCartView }
            ].filter(Boolean).map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                  if(item.id === 'Home') { setActiveCategory('All'); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setShowSearch(false); setSelectedProduct(null); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); }
                  if(item.id === 'Admin') { setIsAdminView(true); setIsProfileView(false); setIsOrdersView(false); setSelectedProduct(null); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); }
                  if(item.id === 'Profile') {
                    if (user) {
                       setIsProfileView(true); setIsAdminView(false); setIsOrdersView(false); setSelectedProduct(null); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); setIsAuthView(false);
                    } else {
                       setIsAuthView(true);
                    }
                  }
                  if(item.id === 'Wishlist') setIsWishlistOpen(true);
                  if(item.id === 'Bag') { setIsCartView(true); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setSelectedProduct(null); setIsCheckoutView(false); setIsThankYouView(false); }
                  if(item.id === 'Logout') handleLogout();
                }}
                className="flex flex-col items-center gap-0.5 relative"
              >
                <div className={`p-1 rounded-xl transition-colors ${item.active ? 'text-[#009ef7]' : 'text-zinc-500'}`}>
                  <item.icon className="w-5 h-5" />
                  {item.count ? (
                    <span className="absolute top-0 right-0 bg-[#009ef7] text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full font-bold">
                      {item.count}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[8px] uppercase font-bold ${item.active ? 'text-white' : 'text-zinc-500'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DB Connection Warning */}
      {dbError && (
        <div className="fixed bottom-6 right-6 z-[100] max-w-sm">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card border-accent/50 bg-accent/10 rounded-2xl p-4 backdrop-blur-xl"
          >
            <div className="text-accent font-bold text-[10px] uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Database Connection Issue
            </div>
            <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
              {dbError}. Please ensure your MongoDB Atlas IP Whitelist includes 0.0.0.0/0 for testing.
            </p>
          </motion.div>
        </div>
      )}

      {/* Auth Modal removed */}

      {/* Wishlist Drawer */}
      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {/* Order History */}
      <OrderHistory 
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />



      {isAuthView ? (
        <AuthPage onBack={() => setIsAuthView(false)} onLoginSuccess={(userData) => { setUser(userData); setIsAuthView(false); if(userData.role==='admin') setIsAdminView(true); }} />
      ) : isThankYouView ? (
        <ThankYouPage onExplore={() => { setIsThankYouView(false); setActiveCategory('All'); window.scrollTo(0,0); }} />
      ) : isCheckoutView ? (
        <CheckoutPage 
          user={user} 
          onBack={() => { setIsCheckoutView(false); setIsCartView(true); }} 
          onCheckoutSuccess={() => { setIsCheckoutView(false); setIsThankYouView(true); clearCart(); }} 
        />
      ) : isCartView ? (
        <CartPage 
          onBack={() => setIsCartView(false)} 
          onProceedCheckout={() => { 
            if(!user) { setIsAuthView(true); return; }
            setIsCartView(false); 
            setIsCheckoutView(true); 
          }} 
        />
      ) : isAdminView ? (
        <Dashboard onBack={() => setIsAdminView(false)} />
      ) : isProfileView ? (
        <ProfilePage onBack={() => setIsProfileView(false)} user={user} setUser={setUser} onLogout={handleLogout} />
      ) : isOrdersView ? (
        <OrdersPage onBack={() => setIsOrdersView(false)} />
      ) : selectedProduct ? (
        <ProductPage 
          product={selectedProduct} 
          allProducts={products}
          onProductSelect={(p) => { setSelectedProduct(p); window.scrollTo(0,0); }}
          user={user} 
          onBack={() => setSelectedProduct(null)} 
        />
      ) : (
        <main className="pt-[80px] lg:pt-[70px] pb-[calc(100px+env(safe-area-inset-bottom))] lg:pb-12">
          {activeCategory === 'All' && (
          <div className="mb-4">
            {/* Supreme Hero Banner */}
            <div className="w-full relative mt-2 mb-8 bg-black overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentBannerIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  src={bannerImages[currentBannerIndex]} 
                  alt="Hero Banner" 
                  className="w-full object-cover lg:h-[600px] h-[400px]"
                  style={{objectPosition: "center 20%"}}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent flex flex-col justify-end items-center pb-6">
                <h2 className="text-white text-5xl font-black uppercase italic tracking-tighter" style={{textShadow: '0px 4px 20px rgba(0,0,0,0.8)'}}>{bannerTitle}</h2>
                <h3 className="text-zinc-700 text-lg uppercase tracking-[0.4em] mb-4">{bannerSubtitle}</h3>
                {bannerImages.length > 1 && (
                  <div className="flex gap-2 mb-2">
                    {bannerImages.map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 transform rotate-45 transition-colors cursor-pointer ${i === currentBannerIndex ? 'bg-[#050505] scale-125' : 'bg-white/50 hover:bg-gray-400'}`}
                        onClick={() => setCurrentBannerIndex(i)}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold uppercase text-white">Our Bestsellers</h2>
            </div>
          </div>
        )}

        {/* Product Listing */}
        <section className="px-4 lg:px-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <div className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">Curated Styles</div>
              <h2 className="text-2xl lg:text-4xl font-black uppercase text-white">
                {activeCategory}
              </h2>
            </div>
            <div className="flex gap-4">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg px-4 py-2.5 text-[10px] sm:text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#009ef7] focus:border-transparent min-w-[120px] uppercase tracking-wider cursor-pointer appearance-none shadow-sm transition-colors pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '14px'
                }}
              >
                <option value="new">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-12">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-3xl p-4 h-[300px] lg:h-[500px] animate-pulse bg-[#050505]/5" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-12">
              {filteredAndSortedProducts
                .slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
                .map((p) => (
                <ProductCard 
                  key={p._id} 
                  product={p} 
                  onOpenDetails={() => { setSelectedProduct(p); window.scrollTo(0, 0); }}
                />
              ))}
            </div>
          )}

          {!loading && filteredAndSortedProducts.length > PRODUCTS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-[#050505] border border-white/10 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-zinc-500 uppercase">
                Page {currentPage} of {Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE)}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE)))}
                disabled={currentPage === Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE)}
                className="px-6 py-3 bg-[#050505] border border-white/10 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {!loading && filteredAndSortedProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-zinc-500 uppercase tracking-widest font-bold">No products found in this category.</p>
            </div>
          )}
        </section>
      </main>
      )}

      {/* Footer */}
      <footer className="py-4 px-4 lg:px-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-500 text-[10px] uppercase font-bold bg-[#050505] pb-24 lg:pb-4">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 items-center text-center md:text-left">
          <div 
            className="text-white text-lg font-black tracking-tighter cursor-pointer"
            onClick={() => { setActiveCategory('All'); setIsAdminView(false); setIsProfileView(false); setIsOrdersView(false); setShowSearch(false); setSelectedProduct(null); setIsCartView(false); setIsCheckoutView(false); setIsThankYouView(false); window.scrollTo(0, 0); }}
          >
            ETHEN<span className="text-[#009ef7]">STREET</span>
          </div>
          <span>&copy; 2024 Bengaluru, IN</span>
        </div>
        <div className="flex space-x-6 items-center">
          <div className="flex space-x-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="hidden lg:flex space-x-4 opacity-50 grayscale hover:grayscale-0 transition-all">
             <div className="w-10 h-5 bg-zinc-800 rounded-sm" />
             <div className="w-10 h-5 bg-zinc-800 rounded-sm" />
          </div>
        </div>
      </footer>
    </div>
  );
}
