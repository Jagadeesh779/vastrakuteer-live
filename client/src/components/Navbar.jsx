import React, { useState, useRef } from 'react';
import '@fontsource/great-vibes';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, LogOut, Heart, Package, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SearchAutocomplete from './SearchAutocomplete';
import CartPreview from './CartPreview';
import axios from 'axios';
import { API_URL } from '../config';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
    const [bannerVisible, setBannerVisible] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const navigate = useNavigate();

    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Error parsing user data:", error);
        // Optionally clear corrupt data
        localStorage.removeItem('user');
    }

    const { cartItems } = useCart();

    // Calculate total quantity
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            {/* Announcement Banner */}
            {bannerVisible && (
                <div style={{ background: 'linear-gradient(90deg, #065f46, #0d9488, #065f46)', color: 'white', textAlign: 'center', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 500, letterSpacing: '0.03em', position: 'relative', zIndex: 60 }}>
                    🎉 Free shipping on orders above ₹999! &nbsp;|&nbsp; Use code <strong>VASTRA10</strong> for 10% off your first order!
                    <button onClick={() => setBannerVisible(false)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem', opacity: 0.8 }}>✕</button>
                </div>
            )}
            <nav style={{ background: '#F8F8FF', borderBottom: '1px solid rgba(13,148,136,0.1)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} className="sticky top-0 z-50">
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-24 items-center gap-12 relative">

                        {/* Left Group: Logo + Navigation */}
                        <div className="hidden md:flex items-center gap-16">
                            {/* Logo Section */}
                            <Link to="/home" className="flex items-center h-full gap-2" style={{ textDecoration: 'none' }}>
                                <img src={logo} alt="Vastra Kuteer" style={{ height: '170px', width: 'auto', objectFit: 'contain', margin: '-8px 0' }} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1 }}>
                                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '3.4rem', fontWeight: 400, color: '#1a5c3a', lineHeight: 1 }}>Vastra</span>
                                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.35em', color: '#1a1a1a', textTransform: 'uppercase', marginTop: '-5px', marginLeft: '15px' }}>KUTEER</span>
                                </div>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="flex space-x-8 items-center pt-1">
                                <Link to="/home" className="text-gray-900 hover:text-emerald-700 font-bold transition-colors relative group text-[17px]">
                                    Home
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link to="/shop" className="text-gray-900 hover:text-emerald-700 font-bold transition-colors relative group text-[17px]">
                                    Shop
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link to="/collections" className="text-gray-900 hover:text-emerald-700 font-bold transition-colors relative group text-[17px]">
                                    Collections
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                                </Link>
                                <Link to="/about" className="text-gray-900 hover:text-emerald-700 font-bold transition-colors relative group text-[17px]">
                                    About Us
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                                </Link>
                                {/* Admin Link Check */}
                                {user && user.role === 'admin' && (
                                    <Link to="/admin" className="text-red-600 font-bold hover:text-red-800 transition-colors text-[17px]">Admin Dashboard</Link>
                                )}
                            </div>
                        </div>

                        {/* Icons Section */}
                        <div className="hidden md:flex items-center space-x-5">
                            <div className="relative flex items-center rounded-full border border-vastra-blue/20" style={{ background: '#FFFFFF' }}>
                                <div className="hidden lg:block border-r border-vastra-blue/10 px-3 py-1">
                                    <select className="bg-transparent text-xs text-black focus:outline-none cursor-pointer">
                                        <option>All</option>
                                        <option>Sarees</option>
                                        <option>Suits</option>
                                        <option>Kurtis</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search Vastra Kuteer..."
                                        className="pl-3 pr-10 py-2 bg-transparent focus:outline-none text-sm w-56 transition-all focus:w-72 text-black placeholder-black"
                                        value={searchValue}
                                        onChange={e => setSearchValue(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                navigate(`/shop?search=${searchValue}`);
                                                setSearchFocused(false);
                                            }
                                        }}
                                    />
                                    {searchFocused && searchValue.length >= 2 && (
                                        <SearchAutocomplete inputValue={searchValue} onClose={() => { setSearchFocused(false); setSearchValue(''); }} />
                                    )}
                                </div>
                                <button className="absolute right-0 top-0 h-full px-3 text-vastra-teal hover:text-teal-700 transition-colors bg-vastra-gold/20 rounded-r-full hover:bg-vastra-gold/40">
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="focus:outline-none py-2 flex items-center"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-vastra-teal flex items-center justify-center text-white text-sm font-bold shadow-md hover:bg-teal-700 transition-all border-2 border-white">
                                            {user.fullName.charAt(0)}
                                        </div>
                                    </button>

                                    {/* Overlay */}
                                    {profileOpen && (
                                        <div
                                            className="fixed inset-0 top-24 z-40"
                                            onClick={() => setProfileOpen(false)}
                                        ></div>
                                    )}

                                    {/* Floating Profile Card */}
                                    <div className={`fixed right-8 top-28 h-auto w-80 shadow-[0_25px_60px_rgba(0,0,0,0.25)] transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] rounded-[2.5rem] overflow-hidden ${profileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`} style={{ background: '#FAF9FF', border: '1px solid #E9E4FF' }}>
                                        <div className="p-6 h-full flex flex-col">
                                            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                                                <h2 className="text-xl font-serif text-black font-bold">My Profile</h2>
                                                <button onClick={() => setProfileOpen(false)} className="bg-vastra-card p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex items-center space-x-3 mb-5 p-3 rounded-xl bg-vastra-card border border-vastra-border">
                                                <div className="h-10 w-10 rounded-full bg-vastra-teal/20 flex items-center justify-center text-vastra-teal text-lg font-bold border border-vastra-teal/30">
                                                    {user.fullName.charAt(0)}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-black text-sm truncate">{user.fullName}</p>
                                                    <p className="text-[10px] text-emerald-700 truncate">{user.email}</p>
                                                </div>
                                            </div>

                                            <nav className="space-y-2 mb-6">
                                                <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center px-3 py-2.5 text-black hover:bg-emerald-50 rounded-xl transition-all group">
                                                    <User className="h-4 w-4 mr-3 text-emerald-600" />
                                                    <span className="font-semibold text-sm">Profile & Addresses</span>
                                                </Link>
                                                <Link to="/my-orders" onClick={() => setProfileOpen(false)} className="flex items-center px-3 py-2.5 text-black hover:bg-emerald-50 rounded-xl transition-all group">
                                                    <Package className="h-4 w-4 mr-3 text-emerald-600" />
                                                    <span className="font-semibold text-sm">My Orders</span>
                                                </Link>
                                                <Link to="/order-tracking" onClick={() => setProfileOpen(false)} className="flex items-center px-3 py-2.5 text-black hover:bg-emerald-50 rounded-xl transition-all group">
                                                    <div className="h-4 w-4 mr-3 flex items-center justify-center text-emerald-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="m7.5 4.27 9 5.15" />
                                                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                                            <path d="m3.3 7 8.7 5 8.7-5" />
                                                            <path d="M12 22v-10" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-sm">Order Tracking</span>
                                                </Link>
                                                <Link to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center px-3 py-2.5 text-black hover:bg-emerald-50 rounded-xl transition-all group">
                                                    <Heart className="h-4 w-4 mr-3 text-emerald-600" />
                                                    <span className="font-semibold text-sm">Favorites</span>
                                                </Link>
                                                <Link to="/refer" onClick={() => setProfileOpen(false)} className="flex items-center px-3 py-2.5 text-black hover:bg-yellow-50 rounded-xl transition-all group">
                                                    <span className="mr-3 text-yellow-500">🎁</span>
                                                    <span className="font-semibold text-sm">Refer & Earn</span>
                                                    <span className="ml-auto text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">10% OFF</span>
                                                </Link>
                                            </nav>

                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setProfileOpen(false);
                                                }}
                                                className="w-full mt-auto flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-bold shadow-sm group text-sm"
                                            >
                                                <LogOut className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="text-black hover:text-vastra-teal transition-colors"><User className="h-5 w-5" /></Link>
                            )}

                            {/* Cart with Preview */}
                            <div className="relative">
                                <button onClick={() => setCartPreviewOpen(!cartPreviewOpen)} className="relative text-black hover:text-vastra-teal transition-colors">
                                    <ShoppingBag className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-vastra-gold text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                                {cartPreviewOpen && <CartPreview onClose={() => setCartPreviewOpen(false)} />}
                                {cartPreviewOpen && <div className="fixed inset-0 z-[140]" onClick={() => setCartPreviewOpen(false)} />}
                            </div>
                        </div>

                        {/* Mobile Logo Group */}
                        <div className="md:hidden flex items-center h-full py-2">
                            <Link to="/home" className="flex items-center gap-1">
                                <img src={logo} alt="Vastra Kuteer" className="h-40 w-auto object-contain" />
                                <div className="flex flex-col items-start leading-none">
                                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.2rem' }} className="text-emerald-800">Vastra</span>
                                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem' }} className="font-bold tracking-[0.2em] text-gray-900 uppercase -mt-1 ml-3">KUTEER</span>
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-3 rounded-2xl bg-white border border-vastra-teal/10 text-vastra-teal shadow-sm active:scale-95 transition-all"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Premium Mobile Overlay */}
                <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* Glass Backdrop */}
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />

                    <div className="relative h-full flex flex-col p-8 overflow-y-auto">
                        {/* Overlay Header */}
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-1">
                                <img src={logo} alt="Logo" className="h-40 w-auto" />
                                <div className="flex flex-col items-start leading-none">
                                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.4rem' }} className="text-emerald-800">Vastra</span>
                                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem' }} className="font-bold tracking-[0.2em] text-gray-900 uppercase -mt-1 ml-4">KUTEER</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-gray-100 text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Mobile Search */}
                        <div className="mb-10 relative">
                            <input
                                type="text"
                                placeholder="Search our collections..."
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-100 transition-all text-sm"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (navigate(`/shop?search=${searchValue}`), setIsOpen(false))}
                            />
                            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>

                        {/* Navigation Links Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {[
                                { to: '/home', icon: Home, label: 'Home', color: 'bg-emerald-50 text-emerald-700' },
                                { to: '/shop', icon: ShoppingBag, label: 'Shop', color: 'bg-pink-50 text-pink-700' },
                                { to: '/collections', icon: Package, label: 'Collections', color: 'bg-blue-50 text-blue-700' },
                                { to: '/about', icon: User, label: 'About Us', color: 'bg-amber-50 text-amber-700' },
                                { to: '/favorites', icon: Heart, label: 'Favorites', color: 'bg-red-50 text-red-700' },
                                { to: '/order-tracking', icon: Search, label: 'Track Order', color: 'bg-teal-50 text-teal-700' },
                            ].map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex flex-col items-center justify-center p-6 rounded-3xl ${item.color} font-bold transition-all active:scale-95 border border-transparent hover:border-current/10`}
                                >
                                    <item.icon size={24} className="mb-2" />
                                    <span className="text-xs">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Profile/Auth Section */}
                        <div className="mt-auto space-y-4">
                            {user ? (
                                <>
                                    <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-vastra-teal text-white flex items-center justify-center font-bold mr-4">
                                            {user.fullName.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-900 text-sm truncate">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={18} /> Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 bg-vastra-teal text-white font-bold rounded-2xl flex items-center justify-center shadow-lg"
                                >
                                    Sign In to Your Account
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
