import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, AtSign } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { registerUser, googleLogin } from '../../services/api';
import { setCredentials } from '../../store/authSlice';

const Register = () => {
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') === 'artist' ? 'artist' : 'client';
    
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: defaultRole
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await registerUser(formData);
            const { user, accessToken } = res.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success('Account created! Welcome 🎨');
            if (user.role === 'artist') navigate('/artist-dashboard');
            else navigate('/client-dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await googleLogin(credentialResponse.credential, formData.role);
            const data = res.data.data;

            // New user needs profile setup
            if (data.requiresProfile) {
                navigate('/complete-profile', {
                    state: { googleEmail: data.googleEmail, suggestedRole: formData.role }
                });
                return;
            }

            const { user, accessToken } = data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success('Signed up with Google!');
            if (user.role === 'admin') navigate('/admin-dashboard');
            else if (user.role === 'artist') navigate('/artist-dashboard');
            else navigate('/client-dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Google signup failed';
            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-brown relative overflow-hidden bg-bg-cream">
            {/* Left Side - Painted Background (Full screen absolute, behind right panel) */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=3445&auto=format&fit=crop" 
                    alt="Artistic background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-cream/40 to-bg-cream"></div>
            </div>

            {/* Right Side - Register Panel */}
            <div className="relative z-10 w-full flex justify-center lg:justify-end items-center lg:pr-[10%] p-4">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-10 sm:p-12 rounded-[2.5rem] shadow-2xl">
                    
                    {/* Logo */}
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-brown">
                            <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                            <path d="M6.5 17L12 6.5L17.5 17H6.5Z" fill="white" fillOpacity="0.8"/>
                        </svg>
                        <span className="text-xl font-playfair font-bold text-text-brown tracking-tight">
                            Artisan<span className="font-light text-muted-taupe">Connect</span>
                        </span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-playfair mb-3 text-center">
                            Create an Account
                        </h2>
                        <p className="text-center text-stone-500 text-sm">
                            Join the community of talented artists & clients.
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</div>}
                        
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Jane Doe"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400 font-bold">
                                    @
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="janedoe123"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">I want to:</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-stone-400" />
                                </div>
                                <select 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition appearance-none"
                                >
                                    <option value="client">Commission Art (Client)</option>
                                    <option value="artist">Offer Services (Artist)</option>
                                </select>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-btn-brown text-white font-medium py-3.5 rounded-xl hover:bg-opacity-90 transition shadow-md disabled:bg-opacity-50 mt-6"
                        >
                            {loading ? 'Creating account...' : 'Sign up'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-stone-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-stone-500 text-xs tracking-wider">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    setError('Google Signup Failed');
                                }}
                                useOneTap
                                width="360"
                                shape="pill"
                                text="signup_with"
                            />
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-stone-500">
                        Already have an account? <Link to="/login" className="font-bold text-text-brown hover:text-btn-brown transition">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
