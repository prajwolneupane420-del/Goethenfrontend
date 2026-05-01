import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Edit2, Trash2, Plus, X, Upload } from 'lucide-react';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    basePrice: '',
    originalPrice: '',
    discountPercentage: '',
    collectionName: 'EPIC THREAD COLLECTION',
    rating: 4.9,
    reviewsCount: 11,
    colors: '#e28743,#ffffff', // Store as comma-separated in form
    category: 'T-Shirts', // Default
    images: [''],
    sizes: ['S', 'M', 'L', 'XL'],
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || '',
        skuId: product.skuId || '',
        description: product.description || '',
        basePrice: product.basePrice || '',
        originalPrice: product.originalPrice || '',
        discountPercentage: product.discountPercentage || '',
        collectionName: product.collectionName || 'EPIC THREAD COLLECTION',
        rating: product.rating || 4.9,
        reviewsCount: product.reviewsCount || 11,
        colors: product.colors?.join(',') || '#ffffff,#000000',
        category: product.category || 'T-Shirts',
        images: product.images?.length > 0 ? product.images : [''],
        sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        skuId: '',
        description: '',
        basePrice: '',
        originalPrice: '',
        discountPercentage: '',
        collectionName: 'EPIC THREAD COLLECTION',
        rating: 4.9,
        reviewsCount: 11,
        colors: '#ffffff,#000000',
        category: 'T-Shirts',
        images: [''],
        sizes: ['S', 'M', 'L', 'XL'],
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
           ...formData,
           basePrice: Number(formData.basePrice),
           originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
           discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : undefined,
           rating: Number(formData.rating),
           reviewsCount: Number(formData.reviewsCount),
           colors: formData.colors.split(',').map(c => c.trim()),
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save product');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  if (loading) return <div className="animate-pulse text-zinc-500 text-xs italic p-8">Loading products...</div>;

  const filteredProducts = products.filter(p => !searchTerm || (p.skuId && p.skuId.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest italic">Product Catalog</h3>
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search by SKU ID" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-accent text-xs"
          />
          <button 
            onClick={() => handleOpenModal()}
            className="bg-accent text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-black transition-colors shrink-0"
          >
            <Plus className="w-3 h-3" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filteredProducts.map(product => (
          <div key={product._id} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-[10px] bg-white/10 text-white px-3 py-1.5 rounded-lg font-mono font-bold w-24 text-center truncate">
                {product.skuId || 'NO-SKU'}
              </div>
              <div className="font-bold text-sm">{product.title}</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenModal(product)}
                className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button 
                onClick={() => handleDelete(product._id)}
                className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-white transition-colors bg-rose-500/10 hover:bg-rose-500 px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-xs font-bold uppercase tracking-widest border border-white/5 border-dashed rounded-2xl">
            No products found matching SKU
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 relative custom-scrollbar"
          >
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              <div className="flex justify-between items-center mb-6 z-20 sticky top-0 bg-zinc-900/90 backdrop-blur-md pb-2">
                <h2 className="text-xl font-black uppercase tracking-widest">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">SKU ID</label>
                    <input 
                      type="text" 
                      value={formData.skuId}
                      onChange={(e) => setFormData({...formData, skuId: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                      placeholder="e.g. TSH-OV-01"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Original Price (₹)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Discount %</label>
                    <input 
                      type="number" 
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Rating</label>
                    <input 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Reviews</label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.reviewsCount}
                      onChange={(e) => setFormData({...formData, reviewsCount: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Collection</label>
                    <input 
                      type="text" 
                      value={formData.collectionName}
                      onChange={(e) => setFormData({...formData, collectionName: e.target.value})}
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Colors (hex, comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.colors}
                      onChange={(e) => setFormData({...formData, colors: e.target.value})}
                      placeholder="#ff0000,#00ff00"
                      className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                  >
                    <option value="Anime">Anime</option>
                    <option value="Superhero">Superhero</option>
                    <option value="Limited">Limited</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="col-span-full">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Image URLs</label>
                  <div className="space-y-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input 
                            type="url" 
                            required={index === 0}
                            value={img}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[index] = e.target.value;
                              setFormData({...formData, images: newImages});
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                          />
                        </div>
                        {img && (
                          <img src={img} alt={`Preview ${index}`} className="w-12 h-12 object-cover rounded-lg border border-white/10 shrink-0" onError={(e) => e.target.style.display = 'none'} />
                        )}
                        {formData.images.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index);
                              setFormData({...formData, images: newImages});
                            }}
                            className="p-3 bg-white/5 text-rose-500 rounded-xl hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, images: [...formData.images, '']})}
                      className="w-full mt-2 py-4 border-2 border-dashed border-white/10 hover:border-accent text-zinc-400 hover:text-accent rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Another Image
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-accent text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-neon transition-all"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
            
            {editingProduct && (
              <div className="p-5 md:p-8 pt-0 border-t border-white/10 mt-6">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 mt-6">Add Fake Review</h3>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    const fakeName = form.fakeName.value;
                    const rating = form.rating.value;
                    const comment = form.comment.value;
                    
                    try {
                      const res = await fetch('/api/reviews/fake', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                          productId: editingProduct._id,
                          fakeName,
                          rating,
                          comment
                        })
                      });
                      if(res.ok) {
                        alert('Fake review added!');
                        form.reset();
                      } else {
                        const err = await res.json();
                        alert('Error: ' + err.message);
                      }
                    } catch(err) {
                      alert('Network error');
                    }
                  }} 
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Customer Name</label>
                      <input name="fakeName" required type="text" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Rating (1-5)</label>
                      <input name="rating" required type="number" min="1" max="5" defaultValue="5" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comment</label>
                    <textarea name="comment" required rows="2" className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent text-xs" />
                  </div>
                  <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all">
                    Submit Fake Review
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
