import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Lock, Mail, Phone, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage({ onBack, onLoginSuccess }) {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot'
  
  // Registration / Forgot Pass state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Common or specific fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Login fields
  const [identifier, setIdentifier] = useState(''); // email or mobile

  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) return toast.error("Mobile number required");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOtpSent(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) {
        setOtpError("wrong otp try again");
      } else {
        setOtpVerified(true);
        setOtpSuccess("verified sucessfully");
      }
    } catch (err) {
      setOtpError("wrong otp try again");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpVerified) return toast.error("Please verify OTP first");
    if (!name || !password) return toast.error("Name and Password required");
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      localStorage.setItem('token', data.token);
      toast.success("Registered successfully");
      onLoginSuccess(data.user);
    } catch (err) {
      toast.error(err.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      localStorage.setItem('token', data.token);
      toast.success("Logged in successfully");
      onLoginSuccess(data.user);
    } catch (err) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!phone || !otp || !password) return toast.error("All fields required");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Password reset successfully. Please login.");
      setView('login');
      resetStates();
    } catch (err) {
      toast.error(err.message === 'wrong otp try again' ? err.message : 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  const resetStates = () => {
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpError('');
    setOtpSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setIdentifier('');
  };

  const switchView = (newView) => {
    setView(newView);
    resetStates();
  };

  return (
    <div className="min-h-screen pt-[100px] lg:pt-[100px] pb-24 lg:pb-0 px-4 bg-white/5 flex justify-center">
      <div className="w-full max-w-md">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-[#050505] p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden">
          
          <div className="flex gap-4 mb-8">
             <button 
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${view === 'login' ? 'border-white/20 text-white' : 'border-transparent text-zinc-600'}`}
                onClick={() => switchView('login')}
             >
               Login
             </button>
             <button 
                className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-colors ${view === 'register' ? 'border-white/20 text-white' : 'border-transparent text-zinc-600'}`}
                onClick={() => switchView('register')}
             >
               New Customer
             </button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.form 
                key="login"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Email or Mobile Number</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="text" value={identifier} onChange={e=>setIdentifier(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button type="button" onClick={() => switchView('forgot')} className="text-[10px] text-[#009ef7] hover:text-white font-bold uppercase tracking-widest transition-colors">
                    Forgot Password?
                  </button>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-white text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 mt-4">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </motion.form>
            )}

            {view === 'register' && (
              <motion.form 
                key="register"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister} 
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                  </div>
                </div>
                
                <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Mobile Number</label>
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                     <input type="tel" value={phone} disabled={otpVerified} onChange={e=>setPhone(e.target.value)} required placeholder="10-digit number" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none disabled:opacity-70" />
                   </div>
                   {!otpVerified && (
                     <button type="button" onClick={handleSendOTP} disabled={loading || !phone} className="bg-white/10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors whitespace-nowrap">
                       Get OTP
                     </button>
                   )}
                 </div>
                </div>

                {otpSent && !otpVerified && (
                  <div className="bg-[#009ef7]/10 p-4 rounded-xl border border-[#009ef7]/20">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#009ef7] mb-1 block">Enter OTP</label>
                    <div className="flex gap-2">
                       <div className="relative flex-1">
                         <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#009ef7]" />
                         <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} placeholder="6-digit code" className="w-full pl-10 pr-4 py-3 bg-transparent border border-[#009ef7]/30 rounded-xl text-sm focus:border-[#009ef7] outline-none" />
                       </div>
                       <button type="button" onClick={handleVerifyOTP} disabled={loading || !otp} className="bg-[#009ef7] text-white px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#009ef7]/80 transition-colors">
                         Verify
                       </button>
                    </div>
                    {otpError && <div className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-2">{otpError}</div>}
                  </div>
                )}
                
                {otpVerified && otpSuccess && (
                  <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                    {otpSuccess}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Set Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                  </div>
                </div>

                <button disabled={loading || !otpVerified} type="submit" className="w-full bg-[#009ef7] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#008be5] disabled:opacity-50 mt-4">
                  {loading ? 'Processing...' : 'Create User'}
                </button>
              </motion.form>
            )}

            {view === 'forgot' && (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}
                onSubmit={handleResetPassword} 
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h3 className="font-black uppercase tracking-widest text-sm mb-2">Reset Password</h3>
                  <p className="text-[10px] text-zinc-500 font-medium">Verify your mobile number to reset password</p>
                </div>

                <div>
                 <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Mobile Number</label>
                 <div className="flex gap-2">
                   <div className="relative flex-1">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                     <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                   </div>
                   <button type="button" onClick={handleSendOTP} disabled={loading || !phone} className="bg-white/10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-colors whitespace-nowrap">
                     Get OTP
                   </button>
                 </div>
                </div>

                {otpSent && (
                  <>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Enter OTP</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} required placeholder="6-digit code" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm focus:border-white/50 outline-none" />
                      </div>
                    </div>
                  </>
                )}

                <button disabled={loading || !otp || !password} type="submit" className="w-full bg-white text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 mt-4">
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>

                <div className="flex justify-center mt-4">
                  <button type="button" onClick={() => switchView('login')} className="text-[10px] text-zinc-600 hover:text-white font-bold uppercase tracking-widest transition-colors">
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
