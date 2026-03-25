import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';
import axios from 'axios';
import { API_URL } from '../config';
import { useToast } from '../context/ToastContext';

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = React.useState('');
    const [discount, setDiscount] = React.useState(0);
    const [couponMsg, setCouponMsg] = React.useState('');
    const [shippingAddress, setShippingAddress] = React.useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        email: ''
    });

    React.useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                fullName: user.fullName || '',
                email: user.email || ''
            }));
        }
    }, []);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round(total * discount / 100);
    const finalTotal = total - discountAmount;

    const COUPONS = { 'VASTRA10': 10, 'NEWUSER20': 20 };

    const applyCoupon = () => {
        const code = couponCode.trim().toUpperCase();
        if (COUPONS[code]) {
            setDiscount(COUPONS[code]);
            setCouponMsg(`✅ Coupon applied! You save ${COUPONS[code]}%`);
        } else {
            setDiscount(0);
            setCouponMsg('❌ Invalid coupon code. Try VASTRA10 or NEWUSER20');
        }
    };

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const isAddressValid = () => {
        return Object.values(shippingAddress).every(val => val.trim() !== '');
    };

    const handleBuyNow = async () => {
        if (!isAddressValid()) {
            alert("Please fill in all shipping address fields.");
            return;
        }

        try {
            // 1. Get Key ID from Server
            const keyResponse = await fetch(`${API_URL}/api/payment/get-key`);
            const { key } = await keyResponse.json();

            if (!key || key === 'YOUR_KEY_ID_HERE') {
                alert("Payment Config Error: Razorpay Key ID is missing on the server.");
                return;
            }

            // 2. Create Order
            const response = await fetch(`${API_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: finalTotal }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Server failed to create order");
            }

            const order = await response.json();

            const options = {
                key: key,
                amount: order.amount,
                currency: "INR",
                name: "Vastra Kuteer",
                description: "Purchase of Ethnic Wear",
                image: "https://your-logo-url.com/logo.png", // Optional
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const verificationResponse = await fetch(`${API_URL}/api/payment/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }),
                        });
                        const result = await verificationResponse.json();
                        if (result.success) {
                            // Payment Verified - Now Save Order to DB
                            const user = JSON.parse(localStorage.getItem('user'));

                            const orderData = {
                                user: user?._id || user?.id || null,
                                items: cartItems.map(item => ({
                                    product: item._id,
                                    name: item.name,
                                    qty: item.quantity,
                                    price: item.price,
                                    image: item.image,
                                    selectedSize: item.selectedSize
                                })),
                                totalAmount: finalTotal,
                                shippingAddress: shippingAddress,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                paymentResult: {
                                    id: response.razorpay_payment_id,
                                    status: 'COMPLETED',
                                    update_time: new Date().toISOString(),
                                    email_address: user?.email || 'guest@example.com'
                                },
                                isPaid: true,
                                paidAt: new Date().toISOString()
                            };

                            // Cookie handles auth automatically
                            const startOrder = await axios.post(`${API_URL}/api/orders`, orderData);

                            if (startOrder.status === 201) {
                                showToast(`🎉 Payment successful! Order placed. ID: #${startOrder.data._id.slice(-6).toUpperCase()}`, 'success');
                                clearCart();
                                navigate('/my-orders');
                            }
                        } else {
                            alert("Payment Verification Failed: " + (result.message || "Unknown error"));
                        }
                    } catch (err) {
                        console.error("Order Creation Error", err);
                        alert("Payment successful but failed to create order record. Please contact support.");
                    }
                },
                prefill: {
                    name: "Guest User", // You can pull this from user context
                    email: shippingAddress.email,
                    contact: shippingAddress.phone
                },
                theme: {
                    color: "#0F766E"
                }
            };
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error("Payment Error:", error);
            alert(error.message || "Something went wrong with payment.");
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-serif text-gray-800 mb-2">
                    <GradientText text="Your Cart is Empty" />
                </h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                <Link to="/home" className="px-6 py-2 bg-vastra-teal text-white rounded-full hover:bg-teal-700 transition-colors">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cart Items Section */}
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                        <GradientText text="Shopping Cart" />
                    </h1>
                    <div className="bg-vastra-card rounded-xl shadow-md overflow-hidden border border-vastra-border">
                        <ul className="divide-y divide-gray-200">
                            {cartItems.map((item) => (
                                <li key={`${item._id}-${item.selectedSize}`} className="p-6 flex items-center">
                                    <img src={item.image} alt={item.name} className="h-24 w-24 object-cover rounded-md border border-gray-200" />
                                    <div className="ml-6 flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{item.brand}</h3>
                                        <p className="text-gray-500">{item.name}</p>
                                        {item.selectedSize && (
                                            <p className="text-sm text-vastra-teal font-medium mt-1">Size: {item.selectedSize}</p>
                                        )}
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)}
                                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="mx-3 font-medium text-gray-900">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)}
                                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
                                                disabled={item.quantity >= (item.selectedSize && item.sizes ? item.sizes[item.selectedSize] : item.count)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex flex-col items-end">
                                        <span className="text-lg font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                        <button
                                            onClick={() => removeFromCart(item._id, item.selectedSize)}
                                            className="mt-2 text-red-500 hover:text-red-700 text-sm flex items-center"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="p-6 bg-vastra-bg border-t border-vastra-border">
                            {/* Coupon Code */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter code (e.g. VASTRA10)"
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value); setCouponMsg(''); }}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                                    />
                                    <button onClick={applyCoupon} className="px-4 py-2 bg-vastra-teal text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors">Apply</button>
                                </div>
                                {couponMsg && <p className={`text-xs mt-1.5 font-medium ${discount > 0 ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}
                            </div>
                            {/* Price Summary */}
                            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                                <span>Subtotal</span><span>₹{total}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-600 mb-1">
                                    <span>Discount ({discount}%)</span><span>- ₹{discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-6 border-t pt-2 mt-2">
                                <span className="text-lg text-gray-700 font-semibold">Total Amount</span>
                                <span className="text-2xl font-bold text-gray-900">₹{finalTotal}</span>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button onClick={clearCart} className="px-6 py-2 text-gray-600 hover:text-red-600 font-medium">Clear Cart</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Address Section */}
                <div className="bg-vastra-card rounded-xl shadow-md p-6 h-fit border border-vastra-border">
                    <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">
                        <GradientText text="Shipping Address" />
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={shippingAddress.fullName}
                                onChange={handleAddressChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={shippingAddress.street}
                                onChange={handleAddressChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={shippingAddress.city}
                                    onChange={handleAddressChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={shippingAddress.state}
                                    onChange={handleAddressChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="State"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={shippingAddress.zip}
                                    onChange={handleAddressChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="500001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={shippingAddress.phone}
                                    onChange={handleAddressChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="9999999999"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={shippingAddress.email}
                                onChange={handleAddressChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="john.doe@example.com"
                            />
                        </div>

                        <button
                            onClick={handleBuyNow}
                            disabled={!isAddressValid()}
                            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-vastra-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vastra-teal ${!isAddressValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Proceed to Pay ₹{finalTotal}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
