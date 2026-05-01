import { motion } from 'motion/react';
import { ShoppingBag, Star, Plus, Heart, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function ProductCard({ product, onOpenDetails }) {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorited = isInWishlist(product._id);
  const inCart = cart?.some(item => item.id === product._id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
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
      size: 'M' // Defaulting to M or could open a quick size selector. The image shows direct "ADD TO CART" button
    });
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.basePrice;
  const rating = product.rating || 4.9;
  const reviews = product.reviewsCount || 11;
  const colors = product.colors || ['#ffffff', '#000000'];
  const collection = product.collectionName || 'EPIC THREAD COLLECTION';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      onClick={onOpenDetails}
      className="bg-[#050505] border border-white/10 rounded-2xl flex flex-col group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-white/10">
        <img 
          src={product.images[0]} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category Tag */}
        <div className="absolute top-2 left-2 bg-white text-black px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider max-w-[60%] line-clamp-1">
          {product.category || 'PRODUCT'}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-2 right-2 p-1.5 bg-[#050505]/80 backdrop-blur-md rounded-full border border-white/10 transition-all hover:bg-[#050505] active:scale-95 shadow-sm"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#009ef7] text-[#009ef7]' : 'text-zinc-600'}`} />
        </button>

        {/* Rating Overlay */}
        <div 
          className="absolute bottom-2 left-2 bg-[#050505]/90 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 text-[10px] shadow-sm cursor-pointer"
        >
          <div className="w-2 h-2 bg-yellow-400 rounded-sm transform rotate-45 flex items-center justify-center"></div>
          <span className="text-white font-bold">{rating}</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-500">{reviews}</span>
        </div>

        {/* Colors Overlay */}
        <div 
          className="absolute bottom-2 right-2 bg-[#050505]/90 backdrop-blur-md rounded-lg px-2 py-1 flex items-center gap-1.5 text-[10px] shadow-sm cursor-pointer"
        >
          <div className="flex -space-x-1">
            {colors.slice(0, 3).map((color, i) => (
              <div 
                key={i} 
                className="w-3 h-3 rounded-full border border-white/10 shadow-sm"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-zinc-500 font-bold">{colors.length}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4 flex flex-col gap-2 bg-[#050505]">
        <div className="flex flex-col gap-1">
          {/* Price Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-black text-lg leading-none">₹{product.basePrice?.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="text-zinc-600 line-through text-xs md:text-sm leading-none font-medium">₹{product.originalPrice?.toLocaleString()}</span>
                {product.discountPercentage && (
                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold leading-none">{product.discountPercentage}% OFF</span>
                )}
              </>
            )}
          </div>
          
          {/* Best Price Badge */}
          {hasDiscount && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="bg-green-100 rounded text-green-600 p-0.5">
                <Percent className="w-3 h-3" />
              </div>
              <span className="text-green-600 text-[10px] md:text-xs font-medium">
                Best price <span className="font-bold cursor-pointer border-b border-green-600 border-dotted">₹{product.basePrice?.toLocaleString()}</span>
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xs md:text-sm font-bold text-zinc-300 line-clamp-1 mt-1 mb-2 uppercase">
          {product.title}
        </h3>
      </div>

      {/* Add to Cart Button */}
      <div className="px-3 pb-3 md:px-4 md:pb-4 mt-auto bg-[#050505] rounded-b-2xl">
        <button 
          onClick={handleQuickAdd}
          className={`w-full py-2.5 rounded-lg border transition-colors font-bold text-[11px] md:text-xs uppercase flex items-center justify-center
            ${inCart 
              ? 'bg-[#009ef7] border-[#009ef7] text-white' 
              : 'border-white/20 text-white lg:hover:bg-white lg:hover:text-black'
            }`}
        >
          {inCart ? 'Go to Cart' : 'Add To Cart'}
        </button>
      </div>
    </motion.div>
  );
}
