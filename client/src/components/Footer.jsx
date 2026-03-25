import React, { useState } from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubscribed(true);
                setEmail('');
            } else {
                setError(data.message || 'Something went wrong. Try again.');
            }
        } catch (err) {
            setError('Could not connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Newsletter Section */}
                <div className="mb-12 rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(6,95,70,0.8), rgba(13,148,136,0.6))', border: '1px solid rgba(13,148,136,0.3)' }}>
                    <h3 className="text-2xl font-serif font-bold text-white mb-1">Stay in Style</h3>
                    <p className="text-teal-200 text-sm mb-5">Subscribe to get exclusive deals, new arrivals & offers straight to your inbox.</p>
                    {subscribed ? (
                        <div className="text-green-300 font-semibold text-sm">🎉 Thank you for subscribing! Check your inbox for a welcome email.</div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                required
                                placeholder="Enter your email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                style={{ background: 'rgba(255,255,255,0.95)' }}
                                disabled={loading}
                            />
                            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #C9960C, #d4a017)' }}>
                                {loading ? 'Sending...' : 'Subscribe'}
                            </button>
                            {error && <p className="text-red-300 text-xs mt-1 w-full text-left">{error}</p>}
                        </form>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand Info */}
                    <div className="space-y-4">
                        <h2 className="font-serif text-3xl text-vastra-gold font-bold">Vastra Kuteer</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Celebrating the elegance of Indian ethnic wear. Handcrafted sarees, kurtas, and more for the modern soul with a traditional heart.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <a href="https://www.instagram.com/vastra_kuteer?igsh=MTY4a210a2pwOTMwbw==" className="text-gray-400 hover:text-vastra-pink transition-colors" target="_blank" rel="noopener noreferrer"><Instagram className="h-5 w-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-vastra-blue transition-colors"><Facebook className="h-5 w-5" /></a>
                            <a href="https://www.youtube.com/@VASTRAKUTEER" className="text-gray-400 hover:text-red-600 transition-colors" target="_blank" rel="noopener noreferrer"><Youtube className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b-2 border-vastra-teal inline-block pb-1">Quick Links</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link to="/about" className="hover:text-vastra-gold transition-colors">About Us</Link></li>
                            <li><Link to="/collections" className="hover:text-vastra-gold transition-colors">Our Collections</Link></li>
                            <li><Link to="/terms" className="hover:text-vastra-gold transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-vastra-gold transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/blog" className="hover:text-vastra-gold transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b-2 border-vastra-pink inline-block pb-1">Customer Care</h3>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link to="/order-tracking" className="hover:text-vastra-gold transition-colors">Track Order</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-vastra-gold transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/return-policy" className="hover:text-vastra-gold transition-colors">Returns & Refunds</Link></li>
                            <li><Link to="/faq" className="hover:text-vastra-gold transition-colors">FAQs</Link></li>
                            <li><Link to="/contact" className="hover:text-vastra-gold transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-serif font-semibold mb-6 text-white border-b-2 border-vastra-gold inline-block pb-1">Contact Us</h3>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin className="h-6 w-6 text-vastra-teal mt-0.5 flex-shrink-0" />
                                <span>Rudhra Hasthina,D Block 401,NRI Colony,PragathiNagar,Hyderabad, Telangana,India,500090.</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="h-5 w-5 text-vastra-teal" />
                                <span>+91 63016 55436</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="h-5 w-5 text-vastra-teal" />
                                <span>vastrakuteer9@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Vastra Kuteer. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
