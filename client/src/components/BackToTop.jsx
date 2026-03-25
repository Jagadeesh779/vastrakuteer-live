import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <button
            onClick={scrollToTop}
            aria-label="Back to top"
            style={{
                position: 'fixed',
                bottom: '80px',
                right: '24px',
                zIndex: 999,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #065f46, #0d9488)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(13,148,136,0.4)',
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? 'all' : 'none',
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s ease',
            }}
        >
            <ChevronUp className="w-5 h-5" />
        </button>
    );
};

export default BackToTop;
