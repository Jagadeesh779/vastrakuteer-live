import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3200);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    pointerEvents: 'none',
                }}
            >
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ICONS = {
    success: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    error: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    info: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

const COLORS = {
    success: { bg: '#ecfdf5', border: '#6ee7b7', icon: '#059669', text: '#065f46' },
    error: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#7f1d1d' },
    info: { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', text: '#1e3a8a' },
};

const Toast = ({ toast, onRemove }) => {
    const c = COLORS[toast.type] || COLORS.success;
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                minWidth: '240px',
                maxWidth: '340px',
                pointerEvents: 'all',
                animation: 'toastSlideIn 0.3s cubic-bezier(.22,1,.36,1)',
            }}
        >
            <span style={{ color: c.icon, flexShrink: 0 }}>{ICONS[toast.type]}</span>
            <span style={{ color: c.text, fontSize: '14px', fontWeight: 500, flex: 1 }}>{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                style={{ color: c.icon, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', lineHeight: 1, opacity: 0.7 }}
            >✕</button>
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(40px) scale(0.96); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
            `}</style>
        </div>
    );
};
