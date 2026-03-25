import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, Clock, Globe, ShieldCheck } from 'lucide-react';
import GradientText from '../components/GradientText';

const ShippingPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
                        <GradientText text="Shipping Policy" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We take pride in bringing your Vastra Kuteer treasures to your doorstep with speed and care. Here's everything you need to know about our shipping process.
                    </p>
                </div>

                {/* Content Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-teal-100 space-y-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-vastra-pink/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-vastra-teal/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Section 1: Processing Time */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-teal-50 rounded-2xl text-vastra-teal">
                            <Clock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">1. Order Processing</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Because many of our items are handcrafted, we take extra care in quality checking before dispatch.
                            </p>
                            <ul className="space-y-2 text-gray-600 list-disc pl-5 marker:text-vastra-teal">
                                <li>Orders are typically processed within <span className="font-semibold text-gray-900">1-3 business days</span>.</li>
                                <li>You will receive an email and WhatsApp update once your order is shipped.</li>
                                <li>Processing does not occur on Sundays or Public Holidays.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: Delivery Timelines */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-pink-50 rounded-2xl text-vastra-pink">
                            <Truck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">2. Delivery Estimatess</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                We partner with leading courier services to ensure reliable delivery across India.
                            </p>
                            <ul className="space-y-2 text-gray-600 list-disc pl-5 marker:text-vastra-pink">
                                <li><span className="font-semibold text-gray-900">Metro Cities</span>: 3-5 business days.</li>
                                <li><span className="font-semibold text-gray-900">Tier 2 & 3 Cities</span>: 5-8 business days.</li>
                                <li><span className="font-semibold text-gray-900">Remote Areas</span>: 7-10 business days.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Shipping Charges */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-amber-50 rounded-2xl text-vastra-gold">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">3. Shipping Charges</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                We offer <span className="text-vastra-teal font-bold uppercase tracking-wider">Free Shipping</span> on all prepaid orders above ₹2,999 across India. For orders below this amount, a flat shipping fee of ₹99 will be applied at checkout.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 4: Tracking */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-blue-50 rounded-2xl text-blue-500">
                            <Globe className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">4. Order Tracking</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Once your package is on its way, you can track its journey in real-time. Head to our <Link to="/order-tracking" className="text-vastra-teal font-medium hover:underline">Order Tracking</Link> page and enter your Tracking Number or Order ID to see exactly where your Vastra Kuteer purchase is.
                            </p>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="pt-12 text-center text-gray-400 text-sm">
                        Last updated: March 2026
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
