import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Reusing the same aurora styles
import logoImage from '../assets/logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setMessage(res.data.message || 'Password reset link sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            {/* ── Background ── */}
            <div className="aurora-bg">
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
                {/* ── Top Logo ── */}
                <div className="login-top-logo">
                    <img src={logoImage} alt="Vastra Kuteer Logo" className="logo-img" />
                </div>

                {/* ── Glass Morphism Card ── */}
                <div className="login-glass-card">
                    <div className="login-card-header">
                        <h2>Reset <span className="text-teal">Password</span></h2>
                        <p>Enter your email to receive a reset link</p>
                    </div>

                    {error && <div className="login-error-alert">{error}</div>}
                    {message && (
                        <div className="login-error-alert" style={{ background: 'rgba(209, 250, 229, 0.9)', borderColor: '#34d399', color: '#065f46' }}>
                            {message}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <span className="input-icon">✉</span>
                            <input
                                type="email"
                                className="styled-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-solid-teal" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="register-footer">
                        Remember your password?
                        <Link to="/login" className="register-text-link">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
