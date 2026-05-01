import { useState, useEffect } from 'react';
import { Save, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BannerManager() {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('SUPREME');
  const [subtitle, setSubtitle] = useState('Edition');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const res = await fetch('/api/admin/banner');
      if (res.ok) {
        const data = await res.json();
        setImages(data?.images || []);
        if (data?.title) setTitle(data.title);
        if (data?.subtitle) setSubtitle(data.subtitle);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images, title, subtitle })
      });
      if (res.ok) {
        toast.success("Banners saved!");
      } else {
        toast.error("Failed to save banners.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving banners");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = () => {
    if (images.length >= 5) {
      toast.error("Maximum 5 banner images allowed.");
      return;
    }
    setImages([...images, ""]);
  };

  const updateImage = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-zinc-500 uppercase tracking-widest text-xs font-bold">Loading Banners...</div>;

  return (
    <div className="glass-card rounded-[32px] p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white">Hero Banners</h2>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-bold">Manage homepage slider images (Max 5)</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">Banner Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="SUPREME"
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">Banner Subtitle</label>
            <input 
              type="text" 
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Edition"
              className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {images.map((img, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex-1 w-full">
              <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">Image URL {idx + 1}</label>
              <input 
                type="text" 
                value={img}
                onChange={(e) => updateImage(idx, e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent font-mono"
              />
            </div>
            {img ? (
              <img src={img} alt={`Banner ${idx}`} className="w-full md:w-32 h-24 object-cover rounded-xl border border-white/10 bg-black" />
            ) : (
              <div className="w-full md:w-32 h-24 bg-black/50 border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-600">
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-[8px] uppercase tracking-widest font-bold">Preview</span>
              </div>
            )}
            <button 
              onClick={() => removeImage(idx)}
              className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors md:mt-6"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {images.length < 5 && (
          <button 
            onClick={handleAddImage}
            className="w-full py-6 border-2 border-dashed border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:border-white/30 transition-all flex flex-col items-center justify-center font-bold text-xs uppercase tracking-widest gap-2"
          >
            <Plus className="w-6 h-6" />
            Add Banner Image
          </button>
        )}
      </div>
    </div>
  );
}
