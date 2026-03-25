import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Reusing the same aurora styles
import logoImage from '../assets/logo.png';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = parseInt('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
                token,
                newPassword: password
            });
            setMessage(res.data.message || 'Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
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
                        <h2>Set New <span className="text-teal">Password</span></h2>
                        <p>Create a strong password for your account</p>
                    </div>

                    {error && <div className="login-error-alert">{error}</div>}
                    {message && (
                        <div className="login-error-alert" style={{ background: 'rgba(209, 250, 229, 0.9)', borderColor: '#34d399', color: '#065f46' }}>
                            {message}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="styled-input"
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">🔒</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="styled-input"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁' : '👁‍🗨'}
                            </button>
                        </div>

                        <button type="submit" className="btn-solid-teal" disabled={loading}>
                            {loading ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <Link to="/login" className="register-text-link">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
