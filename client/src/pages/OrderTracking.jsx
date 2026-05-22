import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GradientText from '../components/GradientText';
import { Package, Search, Truck, CheckCircle, Clock, Home } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('id');
        if (id) {
            setOrderId(id);
            fetchTrackingInfo(id);
        }
    }, [location]);

    const fetchTrackingInfo = async (id) => {
        setLoading(true);
        setError('');
        setTrackingResult(null);

        try {
            const response = await axios.get(`${API_URL}/api/orders/${id}`);
            const order = response.data;

            // Map status to steps
            const steps = [
                { status: 'Placed', completed: false },
                { status: 'Processing', completed: false },
                { status: 'Shipped', completed: false },
                { status: 'Out for Delivery', completed: false },
                { status: 'Delivered', completed: false }
            ];

            const statusOrder = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
            const currentStatusIndex = statusOrder.indexOf(order.status);

            const updatedSteps = steps.map((step, index) => ({
                ...step,
                completed: index <= currentStatusIndex,
                date: index <= currentStatusIndex ? (index === currentStatusIndex ? new Date(order.updatedAt || order.createdAt).toLocaleDateString() : 'Completed') : 'Pending'
            }));

            setTrackingResult({
                id: order._id,
                status: order.status,
                estimatedDelivery: new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)).toLocaleDateString(),
                steps: updatedSteps,
                items: order.items,
                total: order.totalAmount,
                deliveryInfo: order.deliveryInfo || null
            });
        } catch (err) {
            console.error("Tracking Error", err);
            setError('Order not found or invalid ID');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderId.trim()) return;
        fetchTrackingInfo(orderId);
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-gray-900">
                        <GradientText text="Track Your Order" />
                    </h1>
                    <p className="mt-2 text-gray-600">Enter your order ID to see the current status of your shipment.</p>
                </div>

                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 mb-8 border border-vastra-border">
                    <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-grow relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Package className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal transition-colors"
                                placeholder="Order ID or Tracking Number"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1 ml-1">Use your Order ID (e.g. #A1B2C3) or Courier Tracking Number (AWB)</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 bg-vastra-teal text-white font-medium rounded-lg hover:bg-teal-700 transition-all flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Tracking...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Search className="h-5 w-5 mr-2" />
                                    Track Order
                                </span>
                            )}
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </div>

                {trackingResult && (
                    <div className="bg-vastra-card rounded-2xl shadow-sm p-8 animate-fade-in-up border border-vastra-border">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-100 pb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order #{trackingResult.id.slice(-6).toUpperCase()}</h2>
                                <p className="text-gray-500 text-sm mt-1">Expected Delivery: <span className="font-semibold text-vastra-teal">{trackingResult.estimatedDelivery}</span></p>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col items-end">
                                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-2">
                                    <Truck className="h-4 w-4 mr-2" />
                                    {trackingResult.status}
                                </span>
                                <span className="text-gray-900 font-bold">Total: ₹{trackingResult.total}</span>
                            </div>
                        </div>

                        {/* Delivery Info Card */}
                        {trackingResult.deliveryInfo?.trackingNumber && (
                            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">🚚 Shipment Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-500">Courier</p>
                                        <p className="font-semibold text-gray-900">{trackingResult.deliveryInfo.courierName || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Tracking Number</p>
                                        <p className="font-mono font-semibold text-gray-900">{trackingResult.deliveryInfo.trackingNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Current Location</p>
                                        <p className="font-semibold text-gray-900">{trackingResult.deliveryInfo.currentLocation || '—'}</p>
                                    </div>
                                </div>
                                {trackingResult.deliveryInfo.updatedAt && (
                                    <p className="text-xs text-blue-400 mt-2">Updated: {new Date(trackingResult.deliveryInfo.updatedAt).toLocaleString()}</p>
                                )}
                            </div>
                        )}

                        {/* Order Items Preview */}
                        <div className="mb-8">
                            <h3 className="text-sm font-medium text-gray-500 mb-4">Items in Order</h3>
                            <div className="flex -space-x-2 overflow-hidden">
                                {trackingResult.items.map((item, idx) => (
                                    <img key={idx} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src={item.image} alt={item.name} title={item.name} />
                                ))}
                            </div>
                        </div>

                        <div className="relative pt-2">
                            {/* Vertical Line Background */}
                            <div className="absolute left-5 top-0 bottom-0 w-1 bg-gray-200 rounded-full" style={{ height: 'calc(100% - 2.5rem)' }}></div>
                            
                            {/* Active Vertical Progress Line */}
                            {(() => {
                                const lastCompletedIndex = trackingResult.steps.reduce((acc, step, idx) => step.completed ? idx : acc, 0);
                                const pct = (lastCompletedIndex / (trackingResult.steps.length - 1)) * 100;
                                return (
                                    <div 
                                        className="absolute left-5 top-0 w-1 rounded-full transition-all duration-1000 ease-out animated-progress-bar-vertical" 
                                        style={{ 
                                            height: `calc(${pct}% - 0.5rem)`,
                                            maxHeight: 'calc(100% - 2.5rem)'
                                        }}
                                    />
                                );
                            })()}

                            <div className="space-y-10">
                                {(() => {
                                    const lastCompletedIndex = trackingResult.steps.reduce((acc, step, idx) => step.completed ? idx : acc, 0);
                                    const stepIcons = [CheckCircle, Package, Truck, Clock, Home];

                                    return trackingResult.steps.map((step, index) => {
                                        const Icon = stepIcons[index] || Package;
                                        const isCompleted = step.completed;
                                        const isActive = index === lastCompletedIndex;

                                        return (
                                            <div key={index} className="relative flex items-center group">
                                                {/* Icon Node Container */}
                                                <div className="relative flex items-center justify-center z-10">
                                                    {isActive && (
                                                        <>
                                                            <span className="absolute h-14 w-14 rounded-full bg-teal-500/20 animate-ping pointer-events-none" />
                                                            <span className="absolute h-12 w-12 rounded-full bg-teal-500/30 animate-pulse pointer-events-none" />
                                                        </>
                                                    )}
                                                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-500 bg-vastra-bg ${
                                                        isActive
                                                            ? 'border-teal-400 text-white shadow-[0_0_15px_rgba(13,148,136,0.6)] animate-bounce-gentle'
                                                            : isCompleted
                                                                ? 'border-teal-600 text-white shadow-sm'
                                                                : 'border-gray-200 text-gray-300 bg-white'
                                                    }`}
                                                    style={isCompleted ? { background: 'linear-gradient(135deg, #065f46, #0d9488)' } : {}}>
                                                        <Icon className={`h-5 w-5 ${isActive ? 'animate-wiggle' : ''}`} />
                                                    </div>
                                                </div>

                                                {/* Status Details Card */}
                                                <div className={`ml-6 p-4 rounded-2xl border transition-all duration-300 flex-1 ${
                                                    isActive 
                                                        ? 'bg-white shadow-[0_10px_25px_rgba(13,148,136,0.1)] border-teal-200/50 translate-x-1' 
                                                        : 'bg-white/40 border-transparent hover:bg-white/80'
                                                }`}>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className={`font-bold text-sm ${isActive ? 'text-teal-900 font-serif' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                                            {step.status}
                                                        </h3>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                                            isActive 
                                                                ? 'bg-teal-100 text-teal-800 animate-pulse' 
                                                                : isCompleted 
                                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                                    : 'bg-gray-100 text-gray-400'
                                                        }`}>
                                                            {isActive ? 'Current' : isCompleted ? 'Done' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

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

                            .animated-progress-bar-vertical {
                                background: linear-gradient(180deg, #065f46, #0d9488, #2dd4bf, #065f46);
                                background-size: 100% 300%;
                                animation: flowVertical 4s linear infinite;
                            }
                            @keyframes flowVertical {
                                0% { background-position: 50% 0%; }
                                100% { background-position: 50% 300%; }
                            }
                        `}</style>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
