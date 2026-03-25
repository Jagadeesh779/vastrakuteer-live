import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import GradientText from '../components/GradientText';

const Privacy = () => {
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
                        <GradientText text="Privacy Policy" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Your privacy is our priority. At Vastra Kuteer, we are committed to protecting your personal information and being transparent about how we use it.
                    </p>
                </div>

                {/* Content Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-teal-100 space-y-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-vastra-pink/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-vastra-teal/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Section 1: Info Collection */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-teal-50 rounded-2xl text-vastra-teal">
                            <Eye className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                We collect information you provide directly to us when you create an account, place an order, or subscribe to our newsletter. This includes:
                            </p>
                            <ul className="space-y-2 text-gray-600 list-disc pl-5 marker:text-vastra-teal">
                                <li>Name and contact details (email, phone, address).</li>
                                <li>Payment information for transaction processing.</li>
                                <li>Order history and preferences.</li>
                                <li>Account credentials for secure access.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: How We Use It */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-pink-50 rounded-2xl text-vastra-pink">
                            <Shield className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Your data helps us provide a seamless shopping experience. We use it to:
                            </p>
                            <ul className="space-y-2 text-gray-600 list-disc pl-5 marker:text-vastra-pink">
                                <li>Process and deliver your handcrafted orders.</li>
                                <li>Communicate order status and tracking updates.</li>
                                <li>Send exclusive offers and updates (with your consent).</li>
                                <li>Improve our products and website functionality.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Data Security */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-amber-50 rounded-2xl text-vastra-gold">
                            <Lock className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">3. Data Security</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                We implement industry-standard security measures to protect your data. All sensitive information (like payment details) is encrypted and processed through secure payment gateways like Razorpay. We do not store your complete credit/debit card information on our servers.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 4: Your Rights */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-blue-50 rounded-2xl text-blue-500">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">4. Your Rights</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                You have the right to access, update, or delete your personal information at any time. You can manage your profile settings or contact our support team for assistance with data-related requests.
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

export default Privacy;
