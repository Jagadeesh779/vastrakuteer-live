import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GradientText from '../components/GradientText';
import { Package, Search, Truck, CheckCircle, Clock } from 'lucide-react';
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

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" style={{ height: 'calc(100% - 2rem)' }}></div>

                            <div className="space-y-8">
                                {trackingResult.steps.map((step, index) => (
                                    <div key={index} className="relative flex items-start group">
                                        <div className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-vastra-bg ${step.completed ? 'border-vastra-teal bg-teal-50' : 'border-gray-300'}`}>
                                            {step.completed ? (
                                                <CheckCircle className="h-5 w-5 text-vastra-teal" />
                                            ) : (
                                                <div className={`h-2.5 w-2.5 rounded-full ${index === 3 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                            )}
                                        </div>
                                        <div className="ml-12">
                                            <h3 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.status}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;
