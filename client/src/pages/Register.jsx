import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import GradientText from '../components/GradientText';
import logoImage from '../assets/logo.png';
import './Login.css';

const Register = () => {
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); return;
        }
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password
            });
            if (res.data.token) localStorage.setItem('token', res.data.token);
            if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
            alert('Registration Successful! Logging you in...');
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="login-page-container">
            {/* ── Background ── */}
            <div className="aurora-bg">
                <div className="aurora-stars" />
                <div className="ab ab-g1" />
                <div className="ab ab-p1" />
                <div className="ab ab-y1" />
                <div className="ab ab-v1" />
                <div className="ab ab-t1" />
            </div>

            <div className="login-content-wrapper">
                {/* Logo Above Card */}
                <div className="login-top-logo">
                    <img src={logoImage} alt="Vastra Kuteer Logo" className="logo-img" />
                </div>

                <div className="login-glass-card">
                    {/* Heading */}
                    <div className="login-card-header">
                        <h2>Join <span className="text-teal">Vastra Kuteer</span></h2>
                        <p>Create an account to start your ethnic journey</p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <div className="login-error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Full Name */}
                        <div className="input-group">
                            <span className="input-icon">
                                <User size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="fullName" name="fullName" type="text" required
                                placeholder="Full Name"
                                value={formData.fullName} onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="input-group">
                            <span className="input-icon">
                                <Mail size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="email" name="email" type="email" required
                                placeholder="Email Address"
                                value={formData.email} onChange={handleChange}
                            />
                        </div>

                        {/* Password */}
                        <div className="input-group">
                            <span className="input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="password" name="password"
                                type={showPassword ? 'text' : 'password'} required
                                placeholder="Password"
                                value={formData.password} onChange={handleChange}
                            />
                            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="input-group">
                            <span className="input-icon">
                                <Lock size={16} />
                            </span>
                            <input
                                className="styled-input"
                                id="confirmPassword" name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'} required
                                placeholder="Confirm Password"
                                value={formData.confirmPassword} onChange={handleChange}
                            />
                            <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Terms */}
                        <div className="form-options">
                            <label className="checkbox-wrap">
                                <input type="checkbox" required />
                                <span>I agree to the Terms of Service</span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="btn-solid-teal">
                            <UserPlus size={16} />
                            Create Account
                        </button>
                    </form>
                </div>

                {/* Back to Login */}
                <div className="register-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="register-text-link">
                        <ArrowLeft size={14} className="inline-icon" /> Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
