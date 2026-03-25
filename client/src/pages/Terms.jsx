import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Gavel, CheckCircle, AlertTriangle } from 'lucide-react';
import GradientText from '../components/GradientText';

const Terms = () => {
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
                        <GradientText text="Terms & Conditions" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        By using Vastra Kuteer, you agree to these terms. Please read them carefully to understand your rights and responsibilities as a customer.
                    </p>
                </div>

                {/* Content Section */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-teal-100 space-y-12 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-vastra-pink/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-vastra-teal/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Section 1: Introduction */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-teal-50 rounded-2xl text-vastra-teal">
                            <Scale className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                These Terms & Conditions constitute a legally binding agreement between you and Vastra Kuteer regarding your access to and use of our website and services. By accessing the site, you acknowledge that you have read and understood these terms.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: User Accounts */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-pink-50 rounded-2xl text-vastra-pink">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">2. Account Responsibility</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Orders and Pricing */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-amber-50 rounded-2xl text-vastra-gold">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">3. Products & Pricing</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                We strive to display product colors and images accurately, but cannot guarantee that your monitor's display will reflect the exact texture or shade of the handcrafted materials. Prices for our products are subject to change without notice.
                            </p>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 4: Limitation of Liability */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-blue-50 rounded-2xl text-blue-500">
                            <Gavel className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">4. Governing Law</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                These terms are governed by the laws of India. Any dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.
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

export default Terms;
