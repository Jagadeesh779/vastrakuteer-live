import React from 'react';
import GradientText from '../components/GradientText';

const About = () => {
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #E0F2F1 100%)' }}>
            {/* Hero Section */}
            <div className="relative py-24 overflow-hidden">
                {/* Decorative background shapes */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-vastra-teal/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-vastra-green/10 rounded-full blur-3xl"></div>

                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#065f46] via-[#0d9488] to-[#0891b2] font-semibold tracking-wider text-sm uppercase mb-4 block">Est. 2025</span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
                        Our <GradientText text="Story" />
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Weaving traditions into modern elegance, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#065f46] via-[#0d9488] to-[#0891b2] font-semibold">Vastra Kuteer</span> is your destination for authentic Indian ethnic wear that resonates with your soul.
                    </p>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-[#065f46] via-[#0d9488] to-[#0891b2] mx-auto mt-8 rounded-full"></div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="rounded-2xl shadow-xl w-full h-[500px] bg-zinc-900 overflow-hidden">
                            <img
                                src="/about-purple-saree.png"
                                alt="Purple Banarasi Saree"
                                className="w-full h-full object-contain transform scale-[1.08] origin-top-left"
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <span className="text-vastra-teal font-semibold tracking-wider text-sm uppercase">About Us</span>
                        <h2 className="text-3xl font-serif font-bold text-gray-900">
                            <GradientText text="Celebrating Indian Heritage" />
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            At Vastra Kuteer, we believe that clothing is not just about covering oneself; it's an expression of culture, heritage, and identity. Founded in 2025, our mission is to bring the finest handcrafted fabrics from artisans across India directly to your wardrobe.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            From the intricate silk weaves of Kanchipuram to the vibrant block prints of Jaipur, every piece in our collection tells a unique story of craftsmanship and dedication. We work directly with weavers to ensure fair trade and authentic quality.
                        </p>
                        <div className="pt-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                <GradientText text="Why Choose Us?" />
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-center"><span className="w-2 h-2 bg-vastra-teal rounded-full mr-3"></span>Authentic Handloom Products</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-vastra-teal rounded-full mr-3"></span>Premium Quality Assurance</li>
                                <li className="flex items-center"><span className="w-2 h-2 bg-vastra-teal rounded-full mr-3"></span>Supporting Local Artisans</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
