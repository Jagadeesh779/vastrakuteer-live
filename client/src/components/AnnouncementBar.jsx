import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveEvent } from '../utils/eventBannerConfig';

const AnnouncementBar = () => {
    const [visible, setVisible] = useState(true);
    const [current, setCurrent] = useState(0);
    const event = getActiveEvent();

    useEffect(() => {
        const hidden = sessionStorage.getItem('announcementBar_hidden');
        if (hidden) setVisible(false);
    }, []);

    useEffect(() => {
        if (!visible) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % event.announcements.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [visible, event]);

    const handleClose = () => {
        sessionStorage.setItem('announcementBar_hidden', 'true');
        setVisible(false);
    };

    const prev = () => setCurrent(p => (p - 1 + event.announcements.length) % event.announcements.length);
    const next = () => setCurrent(p => (p + 1) % event.announcements.length);

    if (!visible) return null;

    const ann = event.announcements[current];

    return (
        <div style={{
            background: event.colors.bg,
            color: event.colors.text,
            padding: '10px 48px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.3px',
            zIndex: 1000,
            minHeight: '42px',
            transition: 'background 0.8s ease',
            overflow: 'hidden',
        }}>
            {/* Shimmer overlay */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                animation: 'shimmer 3s infinite',
            }} />

            {/* Event emoji badge */}
            <span style={{
                position: 'absolute', left: 12,
                fontSize: 16, lineHeight: 1,
                animation: 'pulse 2s infinite',
            }}>{event.emoji}</span>

            {/* Prev arrow */}
            <button onClick={prev} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px', position: 'absolute', left: 36 }}>
                <ChevronLeft size={15} />
            </button>

            {/* Announcement text */}
            <span key={current} style={{ textAlign: 'center', animation: 'fadeSlide 0.4s ease' }}>
                {ann.text}&nbsp;&nbsp;
                <Link to={ann.link} style={{
                    color: event.colors.accent,
                    fontWeight: '700',
                    textDecoration: 'none',
                    borderBottom: `1px solid ${event.colors.accent}88`,
                    paddingBottom: '1px',
                }}>
                    {ann.linkText} →
                </Link>
            </span>

            {/* Next arrow */}
            <button onClick={next} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px', position: 'absolute', right: 36 }}>
                <ChevronRight size={15} />
            </button>

            {/* Close */}
            <button onClick={handleClose} style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer', padding: '4px',
            }}>
                <X size={14} />
            </button>

            {/* Dots */}
            <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
                {event.announcements.map((_, i) => (
                    <span key={i} onClick={() => setCurrent(i)} style={{
                        width: i === current ? 16 : 5, height: 4, borderRadius: 2,
                        background: i === current ? event.colors.accent : 'rgba(255,255,255,0.35)',
                        cursor: 'pointer', transition: 'all 0.3s',
                    }} />
                ))}
            </div>

            <style>{`
                @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
                @keyframes fadeSlide { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
            `}</style>
        </div>
    );
};

export default AnnouncementBar;
