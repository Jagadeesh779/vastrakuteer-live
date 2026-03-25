import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, Instagram, Facebook, Youtube } from 'lucide-react';
import GradientText from '../components/GradientText';

const Contact = () => {
    const [status, setStatus] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate form submission
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-teal-50 via-white to-pink-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/home" className="inline-flex items-center text-gray-500 hover:text-vastra-teal transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                </div>

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        Get In <GradientText text="Touch" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Have questions about our collections or an existing order? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Contact Info Card */}
                    <div className="lg:col-span-4 bg-gray-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-vastra-teal/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
                        <h2 className="text-2xl font-serif font-bold mb-8 relative z-10">Contact Information</h2>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start gap-4">
                                <MapPin className="text-vastra-teal w-6 h-6 mt-1 flex-shrink-0" />
                                <div className="text-sm text-gray-300 leading-relaxed">
                                    <p className="font-bold text-white mb-1">Our Warehouse</p>
                                    Rudhra Hasthina, D Block 401,<br />
                                    NRI Colony, PragathiNagar,<br />
                                    Hyderabad, Telangana, 500090.
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Phone className="text-vastra-teal w-6 h-6 flex-shrink-0" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-bold text-white mb-1">WhatsApp / Call</p>
                                    +91 63016 55436
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Mail className="text-vastra-teal w-6 h-6 flex-shrink-0" />
                                <div className="text-sm text-gray-300">
                                    <p className="font-bold text-white mb-1">Email Support</p>
                                    vastrakuteer9@gmail.com
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-12 border-t border-gray-800 relative z-10">
                            <h3 className="font-bold text-white mb-4">Follow Us</h3>
                            <div className="flex gap-4">
                                <a href="https://www.instagram.com/vastra_kuteer" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-vastra-teal hover:scale-110 transition-all">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-vastra-blue hover:scale-110 transition-all">
                                    <Facebook size={20} />
                                </a>
                                <a href="https://www.youtube.com/@VASTRAKUTEER" target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 hover:scale-110 transition-all">
                                    <Youtube size={20} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Card */}
                    <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-teal-50">
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                                    <Send size={40} />
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Message Sent!</h3>
                                <p className="text-gray-600 max-w-sm">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                                <button
                                    onClick={() => setStatus('')}
                                    className="mt-8 text-vastra-teal font-bold hover:underline"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-vastra-teal focus:ring-4 focus:ring-teal-50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-vastra-teal focus:ring-4 focus:ring-teal-50 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Order Inquiry / Feedback"
                                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-vastra-teal focus:ring-4 focus:ring-teal-50 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        placeholder="How can we help you today?"
                                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-vastra-teal focus:ring-4 focus:ring-teal-50 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    disabled={status === 'sending'}
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl"
                                >
                                    {status === 'sending' ? (
                                        <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
