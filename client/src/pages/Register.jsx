import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import GradientText from '../components/GradientText';
import logoImage from '../assets/logo.png';
import './Login.css';

const Register = () => {
    const [searchParams] = useSearchParams();
    const referredBy = searchParams.get('ref');
    
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [emailExists, setEmailExists] = useState(false);
    
    const handleEmailBlur = async () => {
        if (!formData.email) return;
        try {
            const res = await axios.post(`${API_URL}/api/auth/check-email`, { email: formData.email });
            setEmailExists(res.data.exists);
        } catch (err) {
            console.error('Email check failed', err);
        }
    };
    const navigate = useNavigate();

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault(); setError('');
        if (emailExists) return;
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match'); return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/send-register-otp`, {
                email: formData.email
            });
            setOtpSent(true);
            alert('OTP sent to your email! Please check your inbox.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault(); setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                otp: otp,
                referredBy: referredBy || undefined
            });
            if (res.data.token) localStorage.setItem('token', res.data.token);
            if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
            
            if (res.data.isNewUser) {
                sessionStorage.setItem('isNewUser', 'true');
            }
            
            alert('Registration Successful! Logging you in...');
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
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

                    <form onSubmit={otpSent ? handleVerifyAndRegister : handleSendOtp} className="login-form">
                        {!otpSent ? (
                            <>
                                {/* Full Name */}
                                <div className="input-group">
                                    <span className="input-icon"><User size={16} /></span>
                                    <input
                                        className="styled-input"
                                        id="fullName" name="fullName" type="text" required
                                        placeholder="Full Name"
                                        value={formData.fullName} onChange={handleChange}
                                    />
                                </div>

                                {/* Email */}
                                <div className="input-group">
                                    <span className="input-icon"><Mail size={16} /></span>
                                    <input
                                        className="styled-input"
                                        id="email" name="email" type="email" required
                                        placeholder="Email Address"
                                        value={formData.email} onChange={handleChange} onBlur={handleEmailBlur}
                                    />
                                </div>
                                {emailExists && (
                                    <div className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1" style={{ marginBottom: "15px", marginLeft: "5px" }}>
                                        <span>Email already registered!</span>
                                        <Link to="/forgot-password" style={{textDecoration: "underline", color: "#ef4444"}}>Send Reset Link</Link>
                                        <span>or</span>
                                        <Link to="/login" style={{textDecoration: "underline", color: "#ef4444"}}>Log in</Link>
                                    </div>
                                )}

                                {/* Password */}
                                <div className="input-group">
                                    <span className="input-icon"><Lock size={16} /></span>
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
                                    <span className="input-icon"><Lock size={16} /></span>
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

                                {/* Submit OTP Req */}
                                <button type="submit" className="btn-solid-teal" disabled={loading || emailExists}>
                                    <Mail size={16} style={{marginRight: "8px"}} />
                                    {loading ? 'Sending Verification...' : 'Send OTP via Email'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="login-card-header" style={{marginBottom: "20px"}}>
                                    <p style={{color: "#059669", fontWeight: "bold", fontSize: "14px"}}>OTP sent successfully to {formData.email}</p>
                                </div>
                                <div className="input-group">
                                    <span className="input-icon"><Lock size={16} /></span>
                                    <input
                                        className="styled-input"
                                        type="text" required
                                        placeholder="Enter 6-digit OTP"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                        style={{letterSpacing: "4px", fontSize: "18px", textAlign: "center"}}
                                    />
                                </div>
                                <button type="submit" className="btn-solid-teal" disabled={loading}>
                                    <UserPlus size={16} style={{marginRight: "8px"}} />
                                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                                </button>
                                <button type="button" onClick={() => setOtpSent(false)} className="btn-solid-teal" style={{background: "transparent", color: "#6b7280", marginTop: "10px", boxShadow: "none"}}>
                                    Change Email
                                </button>
                            </>
                        )}
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
