import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
    const phoneNumber = "916301655436"; // Provided in footer
    const message = encodeURIComponent("Hello Vastra Kuteer! I'm interested in your collections.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] group flex items-center"
        >
            {/* Tooltip */}
            <span className="mr-3 px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-gray-100">
                Chat with us
            </span>

            {/* Button */}
            <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                <div className="relative p-4 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-colors duration-300 transform hover:scale-110 active:scale-95">
                    <MessageCircle className="h-6 w-6" />
                </div>
            </div>
        </a>
    );
};

export default WhatsAppButton;
