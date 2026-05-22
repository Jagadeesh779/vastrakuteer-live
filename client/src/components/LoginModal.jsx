import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, Eye, EyeOff, ArrowRight, User, UserPlus, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useGoogleLogin } from '@react-oauth/google';
import logoImage from '../assets/logo.png';

/**
 * Floating Login Modal — shown when a guest tries to add to cart / buy now / proceed to checkout.
 * Supports both Sign In and Quick Registration (with OTP verification) tabs.
 * Props:
 *   isOpen      — boolean to show/hide
 *   onClose     — function to close modal
 *   onSuccess   — function called after successful login or registration
 */
const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleLoginChange = (e) =>
        setLoginData({ ...loginData, [e.target.name]: e.target.value });

    const handleRegisterChange = (e) => {
        setRegisterData({ ...registerData, [e.target.name]: e.target.value });
        if (e.target.name === 'email') setEmailExists(false);
    };

    const handleEmailBlur = async () => {
        if (!registerData.email) return;
        try {
            const res = await axios.post(`${API_URL}/api/auth/check-email`, { email: registerData.email });
            setEmailExists(res.data.exists);
        } catch (err) {
            console.error('Email check failed', err);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, loginData);
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

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (emailExists) return;
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/send-register-otp`, {
                email: registerData.email
            });
            setOtpSent(true);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                fullName: registerData.fullName,
                email: registerData.email,
                password: registerData.password,
                otp: otp
            });
            if (res.data.token) localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setLoading(false);
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal Card */}
            <div
                className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale my-8"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(243,244,246,0.98) 100%)',
                    border: '1px solid rgba(13,148,136,0.2)',
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Logo & Header */}
                <div className="px-8 pt-8 pb-4 text-center">
                    <img src={logoImage} alt="Vastra Kuteer" className="h-12 mx-auto mb-2" />
                    <h2 className="text-xl font-bold text-gray-900 font-serif">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {mode === 'login' 
                            ? 'Please sign in to complete your purchase' 
                            : 'Sign up to track orders, save favorites & more'}
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-100/50">
                    <button
                        type="button"
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 ${
                            mode === 'login' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/40'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('register'); setError(''); }}
                        className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 ${
                            mode === 'register' 
                                ? 'border-teal-600 text-teal-700 bg-white' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/40'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-6">
                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    {mode === 'login' ? (
                        /* Login Form */
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
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
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
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
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
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
                                className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}
                            >
                                <LogIn size={16} />
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        /* Register Form */
                        <form onSubmit={otpSent ? handleVerifyAndRegister : handleRegisterSubmit} className="space-y-4">
                            {!otpSent ? (
                                <>
                                    {/* Full Name */}
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={16} />
                                        </span>
                                        <input
                                            name="fullName"
                                            type="text"
                                            required
                                            placeholder="Full Name"
                                            value={registerData.fullName}
                                            onChange={handleRegisterChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
                                        />
                                    </div>

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
                                            value={registerData.email}
                                            onChange={handleRegisterChange}
                                            onBlur={handleEmailBlur}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
                                        />
                                    </div>
                                    {emailExists && (
                                        <div className="text-red-500 text-xs font-semibold px-1">
                                            Email already registered! Please switch to Sign In.
                                        </div>
                                    )}

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
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            placeholder="Confirm Password"
                                            value={registerData.confirmPassword}
                                            onChange={handleRegisterChange}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Send OTP button */}
                                    <button
                                        type="submit"
                                        disabled={loading || emailExists}
                                        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}
                                    >
                                        <Mail size={16} />
                                        {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    {/* OTP Info banner */}
                                    <div className="bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-4 py-2.5 rounded-lg text-center">
                                        OTP sent successfully to {registerData.email}
                                    </div>

                                    {/* OTP Input */}
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <ShieldCheck size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            maxLength="6"
                                            placeholder="Enter 6-digit OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white text-gray-900 text-center tracking-[4px] font-bold text-lg"
                                        />
                                    </div>

                                    {/* Verify & Create button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50"
                                        style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}
                                    >
                                        <UserPlus size={16} />
                                        {loading ? 'Verifying...' : 'Verify & Create Account'}
                                    </button>

                                    {/* Edit email toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setOtpSent(false)}
                                        className="w-full text-center text-xs font-semibold text-gray-500 hover:text-gray-700 mt-2"
                                    >
                                        Change details / Edit Email
                                    </button>
                                </>
                            )}
                        </form>
                    )}

                    {/* Divider & Google Login (only shown when not waiting for OTP verification) */}
                    {(!otpSent || mode === 'login') && (
                        <>
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">or continue with</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                onClick={() => googleLogin()}
                                className="w-full py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors text-sm shadow-sm"
                            >
                                <span className="text-base font-bold" style={{ color: '#4285F4' }}>G</span>
                                Sign in with Google
                            </button>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.94) translateY(15px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeInScale { animation: fadeInScale 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default LoginModal;
