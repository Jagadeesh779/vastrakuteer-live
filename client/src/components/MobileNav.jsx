import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Grid, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MobileNav = () => {
    const location = useLocation();
    const { cartItems } = useCart();
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

    const navItems = [
        { to: '/home', icon: Home, label: 'Home' },
        { to: '/shop', icon: Grid, label: 'Shop' },
        { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
            style={{ background: '#F8F8FF', borderColor: 'rgba(13,148,136,0.15)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
            {navItems.map(({ to, icon: Icon, label, badge }) => {
                const active = location.pathname === to;
                return (
                    <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative" style={{ color: active ? '#0d9488' : '#6b7280' }}>
                        <div className="relative">
                            <Icon className="w-5 h-5" />
                            {badge > 0 && (
                                <span className="absolute -top-2 -right-2 bg-vastra-gold text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {badge}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{label}</span>
                        {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '24px', height: '3px', borderRadius: '0 0 4px 4px', background: '#0d9488' }} />}
                    </Link>
                );
            })}
        </div>
    );
};

export default MobileNav;
