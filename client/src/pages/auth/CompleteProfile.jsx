import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { completeGoogleProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { User, Lock, AtSign, Palette, Eye, EyeOff } from 'lucide-react';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const googleEmail = location.state?.googleEmail || '';
  const suggestedRole = location.state?.suggestedRole || 'client';

  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: suggestedRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!googleEmail) {
      navigate('/login');
    }
  }, [googleEmail, navigate]);

  const validate = () => {
    const e = {};
    if (!form.username) e.username = 'Username is required';
    else if (!/^[a-z0-9_]{3,20}$/.test(form.username)) e.username = '3-20 chars: lowercase letters, numbers, underscores';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'username' ? value.toLowerCase() : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await completeGoogleProfile({
        googleEmail,
        username: form.username,
        password: form.password,
        fullName: form.fullName,
        role: form.role,
      });
      const { user, accessToken } = res.data.data;
      dispatch(setCredentials({ user, accessToken }));
      toast.success('Profile created! Welcome to ArtisanConnect 🎨');

      if (user.role === 'artist') navigate('/artist-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/client-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
            <p className="text-stone-300 mt-2 text-sm">
              You signed in with <span className="text-amber-400 font-medium">{googleEmail}</span>.<br />
              Create a username and password to finish setup.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-1.5">Full Name (optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-10 py-3 text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-1.5">Username <span className="text-red-400">*</span></label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. artlover_99"
                  className={`w-full bg-white/10 border rounded-xl px-10 py-3 text-white placeholder-stone-400 focus:outline-none transition ${errors.username ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-1.5">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {['client', 'artist'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: r }))}
                    className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      form.role === r
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : 'bg-white/5 border-white/20 text-stone-300 hover:bg-white/10'
                    }`}
                  >
                    {r === 'client' ? '🎭 Art Lover' : '🎨 Artist'}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className={`w-full bg-white/10 border rounded-xl px-10 py-3 text-white placeholder-stone-400 focus:outline-none transition ${errors.password ? 'border-red-400' : 'border-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={`w-full bg-white/10 border rounded-xl px-10 py-3 text-white placeholder-stone-400 focus:outline-none transition ${errors.confirmPassword ? 'border-red-400' : 'border-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25 mt-2"
            >
              {loading ? 'Creating account…' : 'Complete Setup & Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
