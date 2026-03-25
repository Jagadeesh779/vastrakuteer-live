import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_URL } from '../config';
import GradientText from '../components/GradientText';
import logoImage from '../assets/logo.png';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, formData);
            if (res.data.token) localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/home');
        } catch (err) {
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
                navigate('/home');
            } catch {
                setError('Google Sign-In failed. Please try again.');
            }
        },
        onError: () => setError('Google Sign-In failed. Please try again.'),
    });

    return (
        <div className="login-page-container">
            {/* ── Background ── */}
            <div className="aurora-bg">
                <div className="aurora-stars" />
                <div className="ab ab-p1" />
                <div className="ab ab-g1" />
                <div className="ab ab-y1" />
                <div className="ab ab-v1" />
                <div className="ab ab-g2" />
                <div className="ab ab-o1" />
                <div className="ab ab-b1" />
                <div className="ab ab-r1" />
            </div>

            <div className="login-content-wrapper">
                {/* Logo Above Card */}
                <div className="login-top-logo">
                    <img src={logoImage} alt="Vastra Kuteer Logo" className="logo-img" />
                </div>

                <div className="login-glass-card">
                    {/* Heading */}
                    <div className="login-card-header">
                        <h2>Login <span className="text-teal">Portal</span></h2>
                        <p>Enter your credentials to access your account</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="login-error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <Mail size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Input */}
                        <div className="input-group">
                            <span className="input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Options */}
                        <div className="form-options">
                            <label className="checkbox-wrap">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-pw">Forgot password?</Link>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="btn-solid-teal">
                            <Lock size={16} />
                            Sign In
                        </button>

                        {/* Divider */}
                        <div className="divider-wrap">
                            <div className="divider-line"></div>
                            <span className="divider-text">Or continue with</span>
                            <div className="divider-line"></div>
                        </div>

                        {/* Google Login */}
                        <button
                            type="button"
                            className="btn-solid-teal google-btn teal-style"
                            onClick={() => googleLogin()}
                        >
                            <span className="google-g-icon">G</span>
                            Sign in with Google
                        </button>
                    </form>
                </div>

                {/* Register Loop */}
                <div className="register-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="register-text-link">
                        Create Free Account <ArrowRight size={14} className="inline-icon" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
