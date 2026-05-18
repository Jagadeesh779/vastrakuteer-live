import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useGoogleLogin } from '@react-oauth/google';
import logoImage from '../assets/logo.png';

/**
 * Floating Login Modal — shown when a guest tries to add to cart / buy now.
 * Props:
 *   isOpen      — boolean to show/hide
 *   onClose     — function to close modal
 *   onSuccess   — function called after successful login (e.g. re-trigger add to cart)
 */
const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            if (res.data.token) localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setLoading(false);
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleUser = res.data;
                const backendRes = await axios.post(`${API_URL}/api/auth/google-userinfo`, {
                    email: googleUser.email,
                    name: googleUser.name,
                    googleId: googleUser.sub,
                });
                if (backendRes.data.token) localStorage.setItem('token', backendRes.data.token);
                localStorage.setItem('user', JSON.stringify(backendRes.data.user));
                onClose();
                if (onSuccess) onSuccess();
            } catch {
                setError('Google Sign-In failed. Please try again.');
            }
        },
        onError: () => setError('Google Sign-In failed. Please try again.'),
    });

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal Card */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(240,253,250,0.97) 100%)',
                    border: '1.5px solid rgba(13,148,136,0.18)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <img src={logoImage} alt="Vastra Kuteer" className="h-14 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-gray-900 font-serif">
                        Sign in to continue
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Login to add items to your cart & checkout
                    </p>
                </div>

                {/* Body */}
                <div className="px-8 pb-8">
                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={16} />
                            </span>
                            <input
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Lock size={16} />
                            </span>
                            <input
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                            style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}
                        >
                            <LogIn size={16} />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Google */}
                    <button
                        onClick={() => googleLogin()}
                        className="w-full py-3 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm shadow-sm"
                    >
                        <span className="text-lg font-bold" style={{ color: '#4285F4' }}>G</span>
                        Sign in with Google
                    </button>

                    {/* Register link */}
                    <p className="text-center text-sm text-gray-500 mt-5">
                        Don't have an account?{' '}
                        <a href="/register" className="text-teal-600 font-semibold hover:underline">
                            Create one free <ArrowRight size={12} className="inline" />
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.92) translateY(20px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeInScale { animation: fadeInScale 0.25s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LoginModal;
