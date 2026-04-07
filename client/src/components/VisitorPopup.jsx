import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { getActiveEvent } from '../utils/eventBannerConfig';

const VisitorPopup = () => {
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState(''); // 'new_user' or 'event'
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const event = getActiveEvent();

    useEffect(() => {
        const isNewUser = sessionStorage.getItem('isNewUser') === 'true';
        const newSeen = localStorage.getItem('popup_seen');
        const eventSeen = localStorage.getItem(`event_popup_${event.id}_seen`);

        if (isNewUser && !newSeen) {
            setMode('new_user');
            const timer = setTimeout(() => setShow(true), 4000);
            return () => clearTimeout(timer);
        } else if (!isNewUser && !eventSeen) {
            setMode('event');
            const timer = setTimeout(() => setShow(true), 4000);
            return () => clearTimeout(timer);
        }
    }, [event.id]);

    // Lock / unlock body scroll when popup is open
    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [show]);

    const handleClose = () => {
        if (mode === 'new_user') {
            localStorage.setItem('popup_seen', 'true');
            sessionStorage.removeItem('isNewUser'); // Clear track flag
        } else {
            localStorage.setItem(`event_popup_${event.id}_seen`, 'true');
        }
        setShow(false);
    };

    const handleClaim = (e) => {
        e.preventDefault();
        localStorage.setItem('popup_seen', 'true');
        localStorage.setItem('visitor_coupon', 'NEWUSER20');
        sessionStorage.removeItem('isNewUser'); // Clear track flag
        setDone(true);
        setTimeout(() => setShow(false), 2500);
    };

    if (!show) return null;

    if (mode === 'event') {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                <div className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-popup" style={{ background: event.colors.bg }}>
                    {/* Decorative top */}
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${event.colors.accent}, transparent)` }} />

                    <button onClick={handleClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl leading-none z-10">✕</button>

                    <div className="p-8 text-center text-white">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.15)' }}>
                            {event.emoji}
                        </div>
                        <h2 className="text-3xl font-serif font-bold mb-2">{event.popupTitle}</h2>
                        <p className="text-sm mb-4 opacity-90">{event.popupOffer}</p>
                        
                        <div className="my-5 py-4 px-6 rounded-2xl bg-white/10 border border-white/20">
                            <p className="text-xs uppercase tracking-widest mb-1 opacity-80" style={{ color: event.colors.accent }}>Use Code at Checkout</p>
                            <p className="text-4xl font-mono font-bold tracking-widest" style={{ color: event.colors.accent }}>{event.popupCoupon}</p>
                        </div>

                        <Link to="/shop" onClick={handleClose} className="block w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 text-gray-900" style={{ background: event.colors.accent }}>
                            Shop the Sale →
                        </Link>
                        <button onClick={handleClose} className="mt-4 text-white/40 hover:text-white/70 text-xs transition-colors">Maybe later</button>
                    </div>
                </div>
                <style>{`
                    @keyframes popup { from { opacity:0; transform:scale(0.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
                    .animate-popup { animation: popup 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
                `}</style>
            </div>
        );
    }

    // New User Mode
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-popup" style={{ background: 'linear-gradient(135deg, #0f3460 0%, #065f46 100%)' }}>
                {/* Decorative top */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #C9960C, #f59e0b, #C9960C)' }} />

                <button onClick={handleClose} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl leading-none z-10">✕</button>

                <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,150,12,0.2)', border: '2px solid rgba(201,150,12,0.5)' }}>
                        <Tag className="h-8 w-8 text-yellow-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome! 🎉</h2>
                    <p className="text-teal-200 text-sm mb-1">First time here? You're special!</p>
                    <div className="my-5 py-3 px-6 rounded-2xl border border-yellow-400/30" style={{ background: 'rgba(201,150,12,0.15)' }}>
                        <p className="text-yellow-300 text-xs uppercase tracking-widest mb-1">Your Exclusive Code</p>
                        <p className="text-4xl font-mono font-bold text-yellow-400 tracking-widest">NEWUSER20</p>
                        <p className="text-yellow-200 text-xs mt-1">20% OFF your first order!</p>
                    </div>

                    {done ? (
                        <p className="text-green-300 font-semibold">✅ Code saved! Use it at checkout.</p>
                    ) : (
                        <form onSubmit={handleClaim} className="space-y-3">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email to claim"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                style={{ background: 'rgba(255,255,255,0.95)' }}
                            />
                            <button type="submit" className="w-full py-3 rounded-xl font-bold text-gray-900 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #C9960C, #f59e0b)' }}>
                                Claim My 20% Off →
                            </button>
                        </form>
                    )}
                    <button onClick={handleClose} className="mt-4 text-white/40 hover:text-white/70 text-xs transition-colors">No thanks, I'll pay full price</button>
                </div>
            </div>
            <style>{`
                @keyframes popup { from { opacity:0; transform:scale(0.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
                .animate-popup { animation: popup 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            `}</style>
        </div>
    );
};

export default VisitorPopup;
