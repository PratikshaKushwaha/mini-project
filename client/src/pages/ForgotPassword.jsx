import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOtp, resetPassword } from '../services/api';
import { Mail, KeyRound, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/Button';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await forgotPassword(email);
            setMessage(res.data.message);
            if (res.data.data?.previewUrl) {
                console.log("OTP Email Preview URL:", res.data.data.previewUrl);
                // For local dev, we could optionally show a link to the ethereal email
            }
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await verifyOtp(email, otp);
            setMessage('OTP Verified. Please enter your new password.');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or Expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await resetPassword(email, otp, newPassword);
            navigate('/login', { state: { message: "Password reset successful, please login." }});
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex text-text-brown relative overflow-hidden bg-bg-cream">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=3445&auto=format&fit=crop" 
                    alt="Artistic background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bg-cream/40 to-bg-cream"></div>
            </div>

            <div className="relative z-10 w-full flex justify-center lg:justify-end items-center lg:pr-[10%] p-4">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-md p-10 sm:p-12 rounded-[2.5rem] shadow-2xl">
                    
                    <div className="flex justify-center items-center gap-2 mb-8">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-brown">
                            <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                            <path d="M6.5 17L12 6.5L17.5 17H6.5Z" fill="white" fillOpacity="0.8"/>
                        </svg>
                        <span className="text-xl font-playfair font-bold text-text-brown tracking-tight">
                            Artisan<span className="font-light text-muted-taupe">Connect</span>
                        </span>
                    </div>

                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-playfair mb-3">Reset Password</h2>
                        <p className="text-stone-500 text-sm">
                            {step === 1 && "Enter your email to receive an OTP."}
                            {step === 2 && "Enter the 6-digit OTP sent to your email."}
                            {step === 3 && "Create a secure new password."}
                        </p>
                    </div>

                    {error && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded mb-4">{error}</div>}
                    {message && <div className="text-green-600 text-sm text-center bg-green-50 py-2 rounded mb-4">{message}</div>}

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <form className="space-y-4" onSubmit={handleSendOtp}>
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-text-brown ml-1">Account Email</label>
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
                            <Button type="submit" disabled={loading} className="w-full mt-4">
                                {loading ? 'Sending...' : 'Send OTP'} <ArrowRight className="w-4 h-4 ml-2 inline"/>
                            </Button>
                        </form>
                    )}

                    {/* Step 2: OTP Entry */}
                    {step === 2 && (
                        <form className="space-y-4" onSubmit={handleVerifyOtp}>
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-text-brown ml-1">6-Digit Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition font-mono tracking-widest text-lg"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full mt-4">
                                {loading ? 'Verifying...' : 'Verify Code'} <ArrowRight className="w-4 h-4 ml-2 inline"/>
                            </Button>
                        </form>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <form className="space-y-4" onSubmit={handleResetPassword}>
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-text-brown ml-1">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-stone-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown focus:border-transparent outline-none transition"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full mt-4 bg-green-600 hover:bg-green-700">
                                {loading ? 'Resetting...' : 'Update Password'}
                            </Button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-sm text-stone-500">
                        Remember your password? <Link to="/login" className="font-bold text-text-brown hover:text-btn-brown transition">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
