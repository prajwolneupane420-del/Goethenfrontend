import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Star, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCw, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductPage({ product, allProducts = [], user, onBack, onProductSelect }) {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState('M');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    return allProducts
      .filter(p => p.category === product.category && p._id !== product._id)
      .sort(() => 0.5 - Math.random()) // Simple random shuffle
      .slice(0, 4);
  }, [product, allProducts]);

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const inCart = cart?.some(item => item.id === product._id && item.size === selectedSize);

  const handleAddToCart = () => {
    if (inCart) {
      window.dispatchEvent(new CustomEvent('openCart'));
      return;
    }
    addToCart({
      id: product._id,
      title: product.title,
      price: product.basePrice,
      image: product.images[0],
      quantity: 1,
      size: selectedSize
    });
  };

  return (
    <div className="min-h-screen pt-[80px] lg:pt-[70px] pb-24 lg:pb-0 px-4 lg:px-12 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / Back Navigation */}
        <div className="py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Collection
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Product Image Section (Scrollable Grid on Desktop, Swipe/Single on Mobile) */}
          <div className="w-full lg:w-[60%] flex gap-2 overflow-x-auto lg:overflow-visible lg:grid lg:grid-cols-2 snap-x snap-mandatory hide-scrollbar">
            {product.images && product.images.length > 0 ? (
              product.images.map((img, idx) => (
                <div key={idx} className="w-full shrink-0 snap-center lg:snap-align-none aspect-[3/4] bg-white/10 rounded-2xl overflow-hidden relative">
                  <img 
                    src={img} 
                    alt={`${product.title} - ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="w-full shrink-0 snap-center lg:snap-align-none lg:col-span-2 aspect-[3/4] bg-white/10 rounded-2xl overflow-hidden relative">
                 <img 
                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2000&auto=format&fit=crop" 
                    alt="Placeholder" 
                    className="w-full h-full object-cover"
                  />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full lg:w-[40%]">
            <div className="space-y-8 pb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {product.category || 'PRODUCT'}
                  </span>
                  <div className="flex items-center gap-1 text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-2 border-l border-white/10">
                    <Star className="w-3 h-3 fill-[#009ef7] text-[#009ef7]" />
                    {product.rating || 4.9} ({product.reviewsCount || 120})
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-[1.1] mb-4 text-white">{product.title}</h1>
                
                <div className="flex flex-col gap-1 mb-6 border-y border-white/5 py-4">
                  <div className="flex items-end gap-3 flex-wrap">
                    <div className="text-3xl font-black text-white font-mono tracking-tighter">₹{product.basePrice}</div>
                    {product.originalPrice && product.originalPrice > product.basePrice && (
                      <>
                        <div className="text-lg text-zinc-600 line-through font-mono font-bold mb-1">₹{product.originalPrice}</div>
                        {product.discountPercentage && (
                          <div className="text-sm text-green-600 font-black uppercase tracking-wider mb-1 bg-green-50 px-2 py-0.5 rounded">
                            {product.discountPercentage}% OFF
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Inclusive of all taxes</div>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase tracking-widest font-black text-white flex items-center gap-2">
                    Select Size <span className="text-red-500 text-[10px] ml-2 animate-pulse">Fast Selling!</span>
                  </span>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] uppercase font-bold text-zinc-500 underline decoration-1 underline-offset-4 hover:text-white transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-sm font-black transition-all border-2 ${
                        selectedSize === size 
                          ? 'bg-white text-black border-white/20 scale-105 shadow-xl' 
                          : 'bg-[#050505] text-zinc-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 w-full">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#009ef7] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] lg:text-xs transition-all flex items-center justify-center gap-2 hover:bg-[#008be5] shadow-[0_4px_20px_rgba(0,158,247,0.3)] hover:shadow-[0_8px_25px_rgba(0,158,247,0.4)]"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {inCart ? 'Go to Cart' : 'Add to Bag'}
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`w-14 shrink-0 rounded-xl border-2 transition-all flex items-center justify-center ${
                    isFavorited ? 'border-red-500 bg-red-50' : 'border-white/10 bg-[#050505] hover:border-white/20'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-600'}`} />
                </button>
              </div>

              {/* Product Info Accordions */}
              <div className="mt-8 space-y-4">
                <div className="border border-white/10 rounded-xl p-5 bg-white/5">
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-white mb-2">Product Description</h3>
                   <p className="text-sm leading-relaxed text-gray-600 font-medium">
                    {product.description || "Crafted from premium 100% cotton, this oversized streetwear piece ensures maximum comfort. Featuring high-density puff print and pre-shrunk fabric for a lasting fit."}
                   </p>
                </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-2 pt-6">
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl gap-2 text-center">
                  <div className="bg-[#050505] p-2 rounded-full shadow-sm"><Truck className="w-5 h-5 text-white" /></div>
                  <div className="text-[9px] uppercase tracking-wider font-bold text-zinc-300">Free<br/>Shipping</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl gap-2 text-center">
                  <div className="bg-[#050505] p-2 rounded-full shadow-sm"><RefreshCw className="w-5 h-5 text-white" /></div>
                  <div className="text-[9px] uppercase tracking-wider font-bold text-zinc-300">7 Day<br/>Returns</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl gap-2 text-center">
                  <div className="bg-[#050505] p-2 rounded-full shadow-sm"><ShieldCheck className="w-5 h-5 text-white" /></div>
                  <div className="text-[9px] uppercase tracking-wider font-bold text-zinc-300">Premium<br/>Quality</div>
                </div>
              </div>

              {/* Review Section Integration */}
              <div className="pt-8">
                <ReviewSection productId={product._id} user={user} />
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-white/5">
            <h2 className="text-2xl font-black uppercase text-white mb-8 text-center tracking-tighter">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-8">
              {relatedProducts.map(p => (
                <ProductCard 
                  key={p._id} 
                  product={p} 
                  onOpenDetails={() => onProductSelect?.(p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSizeGuideOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#050505] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl"
            >
              <div className="sticky top-0 bg-[#050505] border-b border-white/5 p-4 flex justify-between items-center z-[100]">
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Oversized T-Shirt</h2>
                <button onClick={() => setIsSizeGuideOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-center text-lg font-black uppercase tracking-widest text-white mb-6">Oversized T-Shirt</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase border-r border-white/10">Size</th>
                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase border-r border-white/10">Chest (In Inches)</th>
                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase">Length (In Inches)</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-black text-white">
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-2 border-r border-white/10">S</td>
                        <td className="py-4 px-2 border-r border-white/10">42</td>
                        <td className="py-4 px-2">28</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-2 border-r border-white/10">M</td>
                        <td className="py-4 px-2 border-r border-white/10">44</td>
                        <td className="py-4 px-2">29</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-2 border-r border-white/10">L</td>
                        <td className="py-4 px-2 border-r border-white/10">46</td>
                        <td className="py-4 px-2">30</td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="py-4 px-2 border-r border-white/10">XL</td>
                        <td className="py-4 px-2 border-r border-white/10">48</td>
                        <td className="py-4 px-2">31</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-2 border-r border-white/10">XXL</td>
                        <td className="py-4 px-2 border-r border-white/10">50</td>
                        <td className="py-4 px-2">31.5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-8 bg-white/10 rounded-xl overflow-hidden relative">
                  <div className="flex justify-between p-4 bg-white/10 font-bold text-xs uppercase tracking-widest text-center">
                    <div className="w-1/2">Regular Fit</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">V/S</div>
                    <div className="w-1/2 text-white font-black">Oversized Fit</div>
                  </div>
                  <div className="flex aspect-square">
                    <div className="w-1/2 bg-gray-300 relative border-r border-white">
                      <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="Regular Fit" />
                    </div>
                    <div className="w-1/2 bg-white/10 relative">
                      <img src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-90" alt="Oversized Fit" />
                      <div className="absolute right-2 top-1/4 text-[8px] font-black uppercase text-white text-right">
                        Dropping<br/>Shoulder<br/>↓
                      </div>
                      <div className="absolute right-2 bottom-1/4 text-[8px] font-black uppercase text-white text-right">
                        Wide<br/>Sleeves<br/>←
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
