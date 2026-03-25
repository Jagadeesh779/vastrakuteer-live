import React, { useState } from 'react';
import { Share2, Copy, Check, Gift } from 'lucide-react';

const ReferFriend = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const referCode = user._id ? `REF${user._id.slice(-6).toUpperCase()}` : 'REF000000';
    const referLink = `${window.location.origin}/register?ref=${referCode}`;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(referLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({ title: 'Vastra Kuteer', text: `Shop ethnic wear with me on Vastra Kuteer! Use my code ${referCode} to get 10% off.`, url: referLink });
        } else {
            handleCopy();
        }
    };

    return (
        <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #FFF7ED 100%)' }}>
            <div className="max-w-lg mx-auto">
                <div className="rounded-3xl overflow-hidden shadow-xl" style={{ background: 'white', border: '1px solid rgba(13,148,136,0.1)' }}>
                    {/* Header */}
                    <div className="p-8 text-center" style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <Gift className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-white">Refer & Earn</h1>
                        <p className="text-teal-100 text-sm mt-1">Share with friends, both get 10% off!</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* How it works */}
                        <div className="space-y-3">
                            {[
                                { step: '1', text: 'Share your unique referral link' },
                                { step: '2', text: 'Friend signs up using your link' },
                                { step: '3', text: 'Both of you get 10% off your next order!' },
                            ].map(item => (
                                <div key={item.step} className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #065f46, #0d9488)' }}>{item.step}</div>
                                    <p className="text-sm text-gray-700">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Referral Code */}
                        <div className="text-center rounded-2xl p-5 border-2 border-dashed border-teal-200" style={{ background: '#F0FDFA' }}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Code</p>
                            <p className="text-3xl font-mono font-bold text-teal-700">{referCode}</p>
                        </div>

                        {/* Copy Link */}
                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-600 truncate font-mono">
                                {referLink}
                            </div>
                            <button onClick={handleCopy} className="px-4 py-2.5 rounded-xl font-semibold text-white text-sm flex items-center gap-1.5 transition-all" style={{ background: copied ? '#065f46' : 'linear-gradient(135deg, #0d9488, #065f46)' }}>
                                {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
                            </button>
                        </div>

                        {/* Share Button */}
                        <button onClick={handleShare} className="w-full py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #C9960C, #f59e0b)' }}>
                            <Share2 className="h-5 w-5" /> Share with Friends
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferFriend;
