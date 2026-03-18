import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import api, { googleLogin } from '../../services/api';
import { setCredentials } from '../../store/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user, accessToken } = res.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success('Logged in successfully!');
            
            // Redirect based on role
            if (user.role === 'admin') navigate('/admin-dashboard');
            else if (user.role === 'artist') navigate('/artist-dashboard');
            else navigate('/client-dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            setLoading(true);
            const res = await googleLogin(credentialResponse.credential);
            const { user, accessToken } = res.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success('Logged in with Google!');
            
            if (user.role === 'admin') navigate('/admin-dashboard');
            else if (user.role === 'artist') navigate('/artist-dashboard');
            else navigate('/client-dashboard');
        } catch (err) {
            const message = err.response?.data?.message || 'Google Login failed';
            toast.error(message);
            setError(message);
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
                {/* Gradient overlay to smoothly blend into the background color */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-cream/40 to-bg-cream"></div>
            </div>

            {/* Right Side - Login Panel */}
            <div className="relative z-10 w-full flex justify-center lg:justify-end items-center lg:pr-[10%] p-4">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-10 sm:p-12 rounded-[2.5rem] shadow-2xl">
                    
                    {/* Logo */}
                    <div className="flex justify-center items-center gap-2 mb-10">
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
                            Log in to ArtisanConnect
                        </h2>
                        <p className="text-center text-stone-500 text-sm">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</div>}
                        
                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-text-brown ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-sm font-semibold text-text-brown">Password</label>
                                <Link to="/forgot-password" className="text-sm font-medium text-stone-500 hover:text-text-brown transition">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-stone-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-btn-brown text-white font-medium py-3.5 rounded-xl hover:bg-opacity-90 transition shadow-md disabled:bg-opacity-50 mt-4"
                        >
                            {loading ? 'Logging in...' : 'Log in'}
                        </button>

                        <div className="relative my-8">
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
                                    setError('Google Login Failed');
                                }}
                                useOneTap
                                width="360"
                                shape="pill"
                            />
                        </div>
                    </form>

                    <p className="mt-8 text-center text-sm text-stone-500">
                        Don't have an account? <Link to="/register" className="font-bold text-text-brown hover:text-btn-brown transition">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
