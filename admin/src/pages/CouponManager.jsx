import { useState, useEffect } from 'react';
import { Tag, Trash2, Edit2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    discountType: 'fixed',
    minOrderValue: '',
    freeShipping: false,
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId ? `/api/coupons/${editingId}` : '/api/coupons';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        discount: Number(formData.discount),
        minOrderValue: Number(formData.minOrderValue)
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error saving coupon');
      }

      toast.success(editingId ? 'Coupon updated' : 'Coupon created');
      setIsModalOpen(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error deleting coupon');
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openForm = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon._id);
      setFormData({
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType || 'fixed',
        minOrderValue: coupon.minOrderValue || 0,
        freeShipping: coupon.freeShipping || false,
        isActive: coupon.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        discount: '',
        discountType: 'fixed',
        minOrderValue: '',
        freeShipping: false,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-accent animate-pulse">Loading Coupons...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-sm font-black uppercase tracking-widest italic">Coupon Management</h3>
        <button 
          onClick={() => openForm()}
          className="bg-accent text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <div key={coupon._id} className="glass-card rounded-[32px] p-6 relative group border border-white/5">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button onClick={() => openForm(coupon)} className="p-2 bg-white/10 rounded-full hover:bg-accent hover:text-white transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(coupon._id)} className="p-2 bg-white/10 rounded-full hover:bg-rose-500 hover:text-white transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{coupon.code}</h4>
                <div className={`text-[10px] uppercase font-bold tracking-widest ${coupon.isActive ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Discount:</span>
                <span className="text-white font-bold">{coupon.discountType === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Min Order:</span>
                <span className="text-white font-bold">₹{coupon.minOrderValue}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Free Shipping:</span>
                <span className="text-white font-bold">{coupon.freeShipping ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card w-full max-w-md p-8 rounded-[32px] relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest italic">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Discount Size</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : ""}
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                  >
                    <option value="fixed">Fixed Amount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Min Order Value (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={formData.minOrderValue}
                  onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})}
                  className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-accent transition-colors"
                />
              </div>

              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-accent transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.freeShipping}
                  onChange={(e) => setFormData({...formData, freeShipping: e.target.checked})}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm font-bold">Free Shipping?</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-accent transition-colors">
                <input 
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm font-bold">Active globally</span>
              </label>

              <button type="submit" className="w-full bg-accent text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-neon transition-all mt-4">
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
