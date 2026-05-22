import React from 'react';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';

const STEPS = [
    { key: 'placed', label: 'Order Placed', icon: CheckCircle },
    { key: 'packed', label: 'Packed', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
];

const OrderTimeline = ({ status = 'placed' }) => {
    const currentIndex = STEPS.findIndex(s => s.key === status);

    return (
        <div className="w-full py-6 px-2">
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 right-0 h-1.5 bg-gray-200 rounded-full z-0" />
                
                {/* Active Progress with Flowing Gradient */}
                <div
                    className="absolute top-5 left-0 h-1.5 rounded-full z-0 transition-all duration-1000 ease-out animated-progress-bar"
                    style={{
                        width: `${(currentIndex / (STEPS.length - 1)) * 100}%`
                    }}
                />

                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const done = index <= currentIndex;
                    const active = index === currentIndex;
                    
                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                            {/* Icon Wrapper with Custom Pulsing Rings */}
                            <div className="relative flex items-center justify-center">
                                {active && (
                                    <>
                                        <span className="absolute h-14 w-14 rounded-full bg-teal-500/20 animate-ping pointer-events-none" />
                                        <span className="absolute h-12 w-12 rounded-full bg-teal-500/30 animate-pulse pointer-events-none" />
                                    </>
                                )}
                                <div 
                                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative ${
                                        active 
                                            ? 'border-teal-400 text-white shadow-[0_0_15px_rgba(13,148,136,0.6)] animate-bounce-gentle' 
                                            : done 
                                                ? 'border-teal-600 text-white shadow-sm' 
                                                : 'border-gray-200 text-gray-300 bg-white'
                                    }`}
                                    style={done ? { background: 'linear-gradient(135deg, #065f46, #0d9488)' } : {}}
                                >
                                    <Icon className={`h-5 w-5 ${active ? 'animate-wiggle' : ''}`} />
                                </div>
                            </div>

                            {/* Label */}
                            <p className={`text-xs mt-3 font-bold transition-colors duration-300 ${
                                active 
                                    ? 'text-teal-900 text-shadow-glow' 
                                    : done 
                                        ? 'text-teal-700' 
                                        : 'text-gray-400'
                            }`}>
                                {step.label}
                            </p>

                            {/* Status Sub-badge */}
                            {active && (
                                <span className="text-[9px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full mt-1.5 shadow-sm uppercase tracking-wider animate-pulse">
                                    Current
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Injected custom micro-animations */}
            <style>{`
                @keyframes bounceGentle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-gentle {
                    animation: bounceGentle 2s ease-in-out infinite;
                }

                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-8deg); }
                    75% { transform: rotate(8deg); }
                }
                .animate-wiggle {
                    animation: wiggle 1s ease-in-out infinite;
                }

                .animated-progress-bar {
                    background: linear-gradient(90deg, #065f46, #0d9488, #2dd4bf, #065f46);
                    background-size: 300% 100%;
                    animation: flow 4s linear infinite;
                }
                @keyframes flow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 300% 50%; }
                }

                .text-shadow-glow {
                    text-shadow: 0 0 8px rgba(13,148,136,0.2);
                }
            `}</style>
        </div>
    );
};

export default OrderTimeline;

