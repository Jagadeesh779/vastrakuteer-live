import React from 'react';
import { CheckCircle, Package, Truck, Home, Clock } from 'lucide-react';

const STEPS = [
    { key: 'placed', label: 'Order Placed', icon: CheckCircle },
    { key: 'packed', label: 'Packed', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
];

const OrderTimeline = ({ status = 'placed' }) => {
    const currentIndex = STEPS.findIndex(s => s.key === status);

    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full z-0" />
                {/* Active Progress */}
                <div
                    className="absolute top-5 left-0 h-1 rounded-full z-0 transition-all duration-700"
                    style={{
                        background: 'linear-gradient(90deg, #065f46, #0d9488)',
                        width: `${(currentIndex / (STEPS.length - 1)) * 100}%`
                    }}
                />
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const done = index <= currentIndex;
                    const active = index === currentIndex;
                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? 'border-teal-600 text-white' : 'border-gray-200 text-gray-300 bg-white'}`}
                                style={done ? { background: 'linear-gradient(135deg, #065f46, #0d9488)' } : {}}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className={`text-xs mt-2 font-semibold ${done ? 'text-teal-700' : 'text-gray-400'} ${active ? 'text-teal-900' : ''}`}>
                                {step.label}
                            </p>
                            {active && (
                                <span className="text-[10px] text-teal-500 mt-0.5 animate-pulse font-medium">Current</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTimeline;
