import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { getActiveEvent } from '../utils/eventBannerConfig';

const SaleBanner = () => {
    const event = getActiveEvent();

    return (
        <div style={{
            background: event.colors.bg,
            padding: '48px 24px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.8s ease',
        }}>
            {/* Decorative circles */}
            <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(201,150,12,0.15)' }} />
            <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

            {/* Gold top line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${event.colors.accent}, transparent)` }} />

            <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
                    {/* Left */}
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 22 }}>{event.emoji}</span>
                            <span style={{ color: event.colors.accent, fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                                {event.name} — Limited Time
                            </span>
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(26px, 4vw, 42px)',
                            fontFamily: 'Georgia, serif',
                            fontWeight: 700,
                            color: 'white',
                            lineHeight: 1.2,
                            margin: '0 0 12px',
                        }}>
                            {event.saleHeadline.includes('—') ? (
                                <>
                                    {event.saleHeadline.split('—')[0]}—{' '}
                                    <span style={{ color: event.colors.accent }}>{event.saleHeadline.split('—')[1]}</span>
                                </>
                            ) : event.saleHeadline}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 24, maxWidth: 420, lineHeight: 1.6 }}>
                            {event.subText} Use code{' '}
                            <strong style={{ color: event.colors.accent }}>{event.coupon}</strong> at checkout.
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
                            {['Free Shipping > ₹2999', '7-Day Returns', '100% Authentic'].map(tag => (
                                <span key={tag} style={{
                                    padding: '4px 14px', borderRadius: 20,
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500,
                                }}>✓ {tag}</span>
                            ))}
                        </div>

                        <Link to="/shop" style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: `linear-gradient(135deg, ${event.colors.accent}, #f59e0b)`,
                            color: '#1a1a1a', fontWeight: 700, fontSize: 15,
                            padding: '13px 28px', borderRadius: 50,
                            textDecoration: 'none',
                            boxShadow: '0 4px 20px rgba(201,150,12,0.35)',
                        }}>
                            Shop the {event.name} Sale <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Right: Stats */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', flex: '0 1 auto' }}>
                        {event.stats.map(stat => (
                            <div key={stat.label} style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                borderRadius: 16, padding: '20px 24px', textAlign: 'center',
                                backdropFilter: 'blur(8px)', minWidth: 90,
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: event.colors.accent, fontFamily: 'Georgia, serif' }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom line */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${event.colors.accent}, transparent)` }} />
        </div>
    );
};

export default SaleBanner;
