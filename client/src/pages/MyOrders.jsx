import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Package, Clock, ChevronRight, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import GradientText from '../components/GradientText';
import OrderTimeline from '../components/OrderTimeline';
import { SkeletonOrderCard } from '../components/SkeletonLoaders';
import { useToast } from '../context/ToastContext';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmCancelId, setConfirmCancelId] = useState(null);
    const { showToast } = useToast();

    const fetchOrders = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;
            const userId = user._id || user.id;
            const response = await axios.get(`${API_URL}/api/orders/myorders/${userId}`);
            setOrders(response.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleCancelOrder = async (orderId) => {
        setCancellingId(orderId);
        try {
            const res = await axios.put(`${API_URL}/api/orders/${orderId}/cancel`);
            const refundInitiated = res.data?.refundInitiated;
            if (refundInitiated) {
                showToast('Order cancelled. Refund initiated — credit in 5-7 business days.', 'info');
            } else {
                showToast('Order cancelled successfully.', 'info');
            }
            setConfirmCancelId(null);
            await fetchOrders();
        } catch (err) {
            const msg = err.response?.data?.msg || 'Failed to cancel order.';
            showToast(msg, 'error');
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                        <GradientText text="My Orders" />
                    </h1>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => <SkeletonOrderCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
                <div className="relative w-28 h-28 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-violet-100 animate-ping opacity-20" />
                    <div className="relative w-28 h-28 rounded-full bg-violet-50 flex items-center justify-center">
                        <ShoppingBag className="h-14 w-14 text-violet-300" />
                    </div>
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                    <GradientText text="No Orders Yet" />
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                    You haven't placed any orders yet. Explore our handcrafted collection and find something beautiful!
                </p>
                <Link
                    to="/shop"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #0d9488)' }}
                >
                    <ShoppingBag className="h-4 w-4" /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                    <GradientText text="My Orders" />
                </h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-vastra-card rounded-xl shadow-sm overflow-hidden border border-vastra-border hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div className="mb-2 md:mb-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1 flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">₹{order.totalAmount}</div>
                                        <div className="text-xs text-gray-500">{order.items.length} items</div>
                                    </div>
                                </div>

                                <div className="mb-4 border-t border-gray-100 pt-4">
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-start">
                                                <img className="h-16 w-16 rounded-md object-cover border border-gray-200" src={item.image} alt={item.name} />
                                                <div className="ml-4 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.selectedSize && `Size: ${item.selectedSize} • `}
                                                        Qty: {item.qty}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Timeline */}
                                {order.status !== 'Cancelled' && (
                                    <div className="mb-3 border-t border-gray-100 pt-4">
                                        <OrderTimeline status={
                                            order.status === 'Delivered' ? 'delivered' :
                                                order.status === 'Shipped' ? 'shipped' :
                                                    order.status === 'Packed' ? 'packed' : 'placed'
                                        } />
                                    </div>
                                )}

                                {/* Estimated Delivery */}
                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                    <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2 mb-3">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span>Estimated delivery: <strong>{new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></span>
                                    </div>
                                )}

                                {/* Refund info for cancelled paid orders */}
                                {order.status === 'Cancelled' && order.razorpay_payment_id && (
                                    <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                                        <span className="text-lg">💸</span>
                                        <div>
                                            <p className="font-semibold text-amber-800">Refund {order.refundStatus === 'Refunded' ? 'Initiated' : 'Status Unknown'}</p>
                                            <p className="text-amber-700">₹{order.totalAmount} will be credited to your account in 5–7 business days.</p>
                                            {order.refundId && <p className="text-gray-400 font-mono text-[10px] mt-0.5">Ref: {order.refundId}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Delivery info */}
                                {order.deliveryInfo?.trackingNumber && (
                                    <div className="mb-3 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 text-xs w-full">
                                        <span className="text-lg">🚚</span>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 flex-1">
                                            {order.deliveryInfo.courierName && <span className="font-semibold text-blue-700">{order.deliveryInfo.courierName}</span>}
                                            <span className="font-mono text-gray-700">AWB: {order.deliveryInfo.trackingNumber}</span>
                                            {order.deliveryInfo.currentLocation && <span className="text-gray-500">📍 {order.deliveryInfo.currentLocation}</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center flex-wrap gap-2">
                                    {/* Cancel Order */}
                                    {['Placed', 'Processing'].includes(order.status) && (
                                        confirmCancelId === order._id ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-600">Cancel this order?</span>
                                                <button
                                                    onClick={() => handleCancelOrder(order._id)}
                                                    disabled={cancellingId === order._id}
                                                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    {cancellingId === order._id ? 'Cancelling...' : 'Yes, Cancel'}
                                                </button>
                                                <button
                                                    onClick={() => setConfirmCancelId(null)}
                                                    className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                                                >
                                                    Keep Order
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setConfirmCancelId(order._id)}
                                                className="flex items-center gap-1.5 text-red-500 text-sm font-medium hover:text-red-700 transition-colors"
                                            >
                                                <XCircle className="h-4 w-4" /> Cancel Order
                                            </button>
                                        )
                                    )}

                                    <Link to={`/order-tracking?id=${order._id}`} className="text-vastra-teal text-sm font-medium hover:text-teal-700 flex items-center transition-colors ml-auto">
                                        Track Order <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
