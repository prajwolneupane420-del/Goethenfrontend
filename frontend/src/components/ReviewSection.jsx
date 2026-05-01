import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to leave a review');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, rating, comment }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setReviews([newReview, ...reviews]);
        setComment('');
        setRating(5);
        toast.success("Review posted!");
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to post review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-4 h-4 text-[#009ef7]" />
        <h3 className="text-xs font-black uppercase tracking-widest italic text-white">Customer Reviews ({reviews.length})</h3>
      </div>

      {/* Add Review form removed; now done in Profile Page */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={review._id}
            className="p-6 rounded-2xl border border-white/5 bg-[#050505] shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white">{review.fakeName || review.user?.name || 'Anonymous'}</div>
                  <div className="text-[8px] text-zinc-500 uppercase tracking-widest">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">"{review.comment}"</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
