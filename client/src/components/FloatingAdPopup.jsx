import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import { getActiveEvent } from '../utils/eventBannerConfig';

const FloatingAdPopup = () => {
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const event = getActiveEvent();

    useEffect(() => {
        const done = sessionStorage.getItem('floatingAd_dismissed');
        if (done) return;
        const timer = setTimeout(() => setVisible(true), 6000);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        sessionStorage.setItem('floatingAd_dismissed', 'true');
        setDismissed(true);
        setTimeout(() => setVisible(false), 350);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed', bottom: 90, right: 20, zIndex: 500,
            width: 300, borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: dismissed ? 'slideOut 0.35s ease forwards' : 'slideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
            {/* Header */}
            <div style={{
                background: event.colors.bg,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>
                        {event.emoji}
                    </div>
                    <div>
                        <p style={{ color: event.colors.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>
                            {event.name}
                        </p>
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>
                            {event.popupTitle}
                        </p>
                    </div>
                </div>
                <button onClick={handleClose} style={{
                    background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
                    cursor: 'pointer', borderRadius: '50%', width: 26, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <X size={13} />
                </button>
            </div>

            {/* Body */}
            <div style={{ background: 'white', padding: '16px' }}>
                <p style={{ color: '#374151', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }}>
                    🎊 <strong style={{ color: '#065f46' }}>{event.popupOffer}</strong> — Limited time only!
                </p>

                {/* Coupon */}
                <div style={{
                    background: '#F0FDF4', border: '1.5px dashed #065f46',
                    borderRadius: 10, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
                }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#065f46', letterSpacing: 2, fontFamily: 'monospace' }}>
                        {event.popupCoupon}
                    </span>
                    <span style={{ fontSize: 11, color: '#6b7280', background: '#e5e7eb', padding: '3px 8px', borderRadius: 6, cursor: 'pointer' }}
                        onClick={() => navigator.clipboard?.writeText(event.popupCoupon)}>
                        Copy
                    </span>
                </div>

                <Link to="/shop" onClick={handleClose} style={{
                    display: 'block', textAlign: 'center',
                    background: event.colors.bg,
                    color: 'white', fontWeight: 700, fontSize: 14,
                    padding: '11px', borderRadius: 12,
                    textDecoration: 'none',
                }}>
                    Shop Now →
                </Link>
                <p style={{ color: '#9ca3af', fontSize: 11, textAlign: 'center', margin: '8px 0 0' }}>
                    *Valid during {event.name}. T&C apply.
                </p>
            </div>

            <style>{`
                @keyframes slideIn { from{opacity:0;transform:translateX(120%) scale(0.9)} to{opacity:1;transform:translateX(0) scale(1)} }
                @keyframes slideOut { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(120%) scale(0.9)} }
            `}</style>
        </div>
    );
};

export default FloatingAdPopup;
