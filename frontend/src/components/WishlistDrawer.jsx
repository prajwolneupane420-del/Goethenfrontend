import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function WishlistDrawer({ isOpen, onClose }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart({
      id: item._id,
      title: item.title,
      price: item.basePrice,
      image: item.images[0],
      quantity: 1,
      size: 'M' // Default size for quick move
    });
    toggleWishlist(item);
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
                <div className="text-xl font-black uppercase tracking-widest">Wishlist</div>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">
                  {wishlist.length} saved
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-[#050505]/5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-[#050505]/5 rounded-full flex items-center justify-center mb-4 text-zinc-700">
                    <Heart className="w-8 h-8" />
                  </div>
                  <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Your wishlist is empty</p>
                </div>
              ) : (
                wishlist.map((item) => (
                  <div key={item._id} className="flex gap-4 group">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold uppercase tracking-tight line-clamp-1">{item.title}</h4>
                          <button 
                            onClick={() => toggleWishlist(item)}
                            className="p-1 text-zinc-600 hover:text-accent transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                          {item.category}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-accent font-mono font-bold text-xs">
                          ₹{item.basePrice}
                        </div>
                        <button 
                          onClick={() => handleMoveToCart(item)}
                          className="flex items-center gap-2 bg-[#050505]/5 hover:bg-accent hover:text-white transition-all px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-bold"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          Add to Bag
                        </button>
                      </div>
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
