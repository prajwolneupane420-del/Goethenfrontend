import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ThankYouPage({ onExplore }) {
  return (
    <div className="min-h-screen pt-[120px] pb-20 px-4 flex items-center justify-center bg-white/5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#050505] rounded-[32px] p-8 text-center shadow-xl border border-white/5"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
            <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </motion.div>
          </div>
        </div>
        
        <h1 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">Thank You!</h1>
        <p className="text-sm text-zinc-500 font-medium mb-8">
          Your order has been placed successfully. You will receive an email confirmation shortly.
        </p>
        
        <button 
          onClick={onExplore}
          className="w-full bg-[#009ef7] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-[#008be5] transition-all"
        >
          Explore More Products <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
