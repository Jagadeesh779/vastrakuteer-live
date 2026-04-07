import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, HelpCircle, ShoppingBag, Truck, RefreshCcw, CreditCard } from 'lucide-react';
import GradientText from '../components/GradientText';

const FAQ = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [openIndex, setOpenIndex] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const faqData = {
        orders: [
            { icon: <ShoppingBag className="w-5 h-5" />, q: "How do I place an order?", a: "Browse our collections, select your items and sizes, and add them to your cart. Once ready, click the cart icon and proceed to checkout using our secure payment gateway." },
            { icon: <ShoppingBag className="w-5 h-5" />, q: "Can I cancel my order?", a: "Orders can only be cancelled within 2 hours of placement. Since we move quickly to process handcrafted items, please contact support immediately if you need to make changes." },
            { icon: <ShoppingBag className="w-5 h-5" />, q: "Do I need an account to buy?", a: "Yes, we require account creation so you can track your orders, manage your profile, and save your favorites for later." }
        ],
        shipping: [
            { icon: <Truck className="w-5 h-5" />, q: "How long does delivery take?", a: "Standard delivery takes 3-7 business days across India. Handloom items may occasionally take 1-2 extra days for final quality inspection." },
            { icon: <Truck className="w-5 h-5" />, q: "How can I track my package?", a: "Use our 'Track Order' page in the footer. You'll need your Order ID or the Tracking Number sent to your email/WhatsApp." },
            { icon: <Truck className="w-5 h-5" />, q: "Do you ship internationally?", a: "Currently, we only ship within India. We plan to expand to international markets soon—stay tuned!" }
        ],
        returns: [
            { icon: <RefreshCcw className="w-5 h-5" />, q: "What is your return policy?", a: "We offer a 7-day return policy for unused items in original packaging. Please check our Returns & Refunds page for full details." },
            { icon: <RefreshCcw className="w-5 h-5" />, q: "How do I get a refund?", a: "Once your return is inspected and approved, the refund is initiated manually via Razorpay and usually reflects in your account within 5-7 business days." }
        ],
        payments: [
            { icon: <CreditCard className="w-5 h-5" />, q: "Is it safe to pay online?", a: "Absolutely. We use Razorpay, India's leading payment gateway, which is PCI-DSS compliant. Your payment details are encrypted and never stored on our servers." },
            { icon: <CreditCard className="w-5 h-5" />, q: "What payment methods do you accept?", a: "We accept all major Credit/Debit Cards, UPI (GPay, PhonePe, etc.), and Net Banking." }
        ]
    };

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-teal-50 via-white to-pink-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        <GradientText text="Frequently Asked Questions" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Find quick answers to your questions about orders, shipping, and more.
                    </p>
                </div>

                {/* FAQ Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {Object.keys(faqData).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setOpenIndex(0); }}
                            className={`px-6 py-2.5 rounded-full font-serif font-bold text-sm transition-all border ${activeTab === tab
                                ? 'bg-vastra-teal text-white border-vastra-teal shadow-lg shadow-teal-700/20 scale-105'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-vastra-teal hover:text-vastra-teal'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {faqData[activeTab].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-sm overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-teal-50/30 transition-colors"
                            >
                                <div className="flex items-center text-gray-900">
                                    <span className="text-vastra-teal mr-4">{item.icon}</span>
                                    <span className="font-bold text-lg">{item.q}</span>
                                </div>
                                {openIndex === idx ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            {openIndex === idx && (
                                <div className="px-6 pb-6 pt-0 animate-fadeIn">
                                    <div className="pl-9 text-gray-600 leading-relaxed border-l-2 border-vastra-teal/30 ml-2.5">
                                        {item.a}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Support CTA */}
                <div className="mt-16 p-8 bg-gray-900 rounded-3xl text-center relative overflow-hidden">
                    <HelpCircle className="w-24 h-24 text-teal-800 absolute -top-4 -right-4 opacity-50" />
                    <h3 className="text-2xl font-serif font-bold text-white mb-2 relative z-10">Still have questions?</h3>
                    <p className="text-gray-400 mb-6 relative z-10">Our team is here to help you. Reach out via WhatsApp or email.</p>
                    <Link
                        to="/about"
                        className="inline-flex items-center px-8 py-3 bg-vastra-gold text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity relative z-10"
                    >
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
