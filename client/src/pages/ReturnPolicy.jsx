import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Package, RefreshCcw, ShieldCheck } from 'lucide-react';
import GradientText from '../components/GradientText';

const ReturnPolicy = () => {
    // Scroll to top on mount
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
                        <GradientText text="Returns & Refunds Policy" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We want you to love your Vastra Kuteer apparel. If something isn't quite right, we're here to help you through our manual return and refund process.
                    </p>
                </div>

                {/* Policy Content Blocks */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-teal-100 space-y-12 relative overflow-hidden">

                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-vastra-pink/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-vastra-teal/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Section 1: Eligibility */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-teal-50 rounded-2xl text-vastra-teal">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">1. Return Eligibility</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You have <span className="font-semibold text-gray-900">7 calendar days</span> to return an item from the date you received it. To be eligible for a return, your item must be:
                            </p>
                            <ul className="space-y-3 text-gray-600 list-disc pl-5 marker:text-vastra-teal">
                                <li>Unused and in the exact same condition that you received it.</li>
                                <li>In the original packaging with all tags, labels, and protective layers intact.</li>
                                <li>Accompanied by the original receipt or proof of purchase.</li>
                            </ul>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 2: How to Return */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-pink-50 rounded-2xl text-vastra-pink">
                            <Package className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">2. Instructions for Return</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Currently, we process all returns and exchanges manually to ensure personal attention. Please follow these steps to initiate your return:
                            </p>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-teal-200 transition-colors">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-vastra-teal text-white text-sm mr-3">1</span>
                                        Contact Support
                                    </h3>
                                    <p className="text-gray-600 text-sm ml-9 leading-relaxed">
                                        Email our support team at <a href="mailto:support@vastrakuteer.com" className="text-vastra-teal hover:underline font-medium">support@vastrakuteer.com</a> or message us on WhatsApp with your Order ID and the reason for the return. Feel free to attach photos if the item is damaged or defective.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-pink-200 transition-colors">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-vastra-pink text-white text-sm mr-3">2</span>
                                        Receive Authorization
                                    </h3>
                                    <p className="text-gray-600 text-sm ml-9 leading-relaxed">
                                        Our team will review your request within 24-48 business hours. Once approved, we will provide you with the exact shipping address for our warehouse facility.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-amber-200 transition-colors">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-vastra-gold text-white text-sm mr-3">3</span>
                                        Ship It Back
                                    </h3>
                                    <p className="text-gray-600 text-sm ml-9 leading-relaxed">
                                        Pack the item securely. <strong className="text-red-500 font-medium">Please note:</strong> You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. We recommend using a trackable shipping service.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Section 3: Refunds */}
                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 p-4 bg-amber-50 rounded-2xl text-vastra-gold">
                            <RefreshCcw className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">3. Refunds Process</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                If your return is approved, we will initiate a manual refund directly to your <span className="font-medium text-gray-900">original method of payment</span> (via Razorpay). You will receive the credit within 5-7 business days, depending on your card issuer's policies.
                            </p>
                        </div>
                    </div>

                    {/* Contact CTA Area */}
                    <div className="relative z-10 mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between shadow-2xl overflow-hidden">
                        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 opacity-10">
                            <Mail className="w-48 h-48 text-white" />
                        </div>
                        <div className="relative z-10 mb-6 sm:mb-0">
                            <h3 className="text-xl font-bold text-white mb-2">Have remaining questions?</h3>
                            <p className="text-gray-400 text-sm">Our customer care team is available Mon-Sat, 10 AM to 6 PM.</p>
                        </div>
                        <a href="mailto:support@vastrakuteer.com" className="relative z-10 px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center shadow-white/10">
                            <Mail className="w-4 h-4 mr-2" />
                            Email Support
                        </a>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ReturnPolicy;
