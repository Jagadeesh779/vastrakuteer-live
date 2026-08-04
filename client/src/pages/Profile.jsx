import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Trash2, ArrowLeft, Package, Download, Share2, Copy, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';
import axios from 'axios';
import { API_URL } from '../config';
import Logo from '../assets/logo.png';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [addresses, setAddresses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '', phone: '' });
    const [error, setError] = useState('');
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchUser();
        fetchAddresses();
        fetchOrders();
    }, []);

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/auth/me`, { headers: { 'x-auth-token': token } });
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
            console.error('Failed to fetch user', err);
        }
    };

    const fetchAddresses = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/user/get-addresses`, { email: user.email });
            setAddresses(res.data);
        } catch (err) {
            console.error('Error fetching addresses', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/orders/myorders/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` }});
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleDownloadInvoice = (order) => {
        const win = window.open('', '_blank');
        const printContent = `
            <html><head>
            <title>Invoice - ${order._id}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    body { margin: 0; padding: 15mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                body { font-family: 'Inter', sans-serif; background: #fff; color: #000; width: 210mm; /* A4 Width */ margin: 0 auto; box-sizing: border-box; }
                .invoice-container { padding: 10mm; display: flex; flex-direction: column; min-height: 297mm; box-sizing: border-box; position: relative; z-index: 1; overflow: hidden; }
                .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
                .header-left { display: flex; flex-direction: column; }
                .company-name { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #065f46; }
                .company-details { font-size: 12px; color: #4b5563; margin-top: 4px; }
                .header-right { text-align: right; }
                .invoice-title { font-size: 32px; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px; }
                .invoice-meta { font-size: 13px; color: #6b7280; }
                .address-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .address-block { width: 45%; }
                .address-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9ca3af; margin-bottom: 8px; letter-spacing: 1px; }
                .customer-name { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 4px; }
                .customer-details { font-size: 13px; color: #4b5563; line-height: 1.5; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #f9fafb; border-bottom: 2px solid #e5e7eb; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; font-weight: 700; color: #4b5563; }
                td { padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #111827; }
                .totals-section { width: 40%; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: #f9fafb; margin-bottom: 40px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #4b5563; }
                .total-row.grand { font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 4px; }
                .footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
            </head><body onload="setTimeout(() => window.print(), 800)">
                <div class="invoice-container">
                    <!-- Subtle Watermark -->
                    <img src="${Logo.startsWith('http') ? Logo : window.location.origin + Logo}" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; opacity: 0.05; z-index: 0; filter: grayscale(100%); pointer-events: none;" alt="" />
                    
                    <div class="header">
                        <div class="header-left">
                            <div class="company-name">VASTRA KUTEER</div>
                            <div class="company-details">123 Heritage Silk Road, Textile Logistics Hub<br/>Surat, Gujarat 395002<br/>Ph: +91 99999 00000<br/>care@vastrakuteer.in</div>
                        </div>
                        <div class="header-right">
                            <div class="invoice-title">TAX INVOICE</div>
                            <div class="invoice-meta"><strong>Order ID:</strong> #${order._id.substring(0, 8).toUpperCase()}</div>
                            <div class="invoice-meta"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                            <div class="invoice-meta"><strong>Status:</strong> <span style="text-transform: uppercase;">PREPAID</span></div>
                        </div>
                    </div>
                    
                    <div class="address-section">
                        <div class="address-block">
                            <div class="address-title">Billed & Shipped To</div>
                            <div class="customer-name">${user.fullName}</div>
                            <div class="customer-details">
                                ${order.shippingAddress.street}<br/>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br/>
                                Phone: ${order.shippingAddress.phone || user.phone || 'N/A'}<br/>
                                Email: ${user.email}
                            </div>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style="text-align: center;">Size</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Unit Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(order.items || []).map(item => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #111827;">${item.name}</div>
                                    </td>
                                    <td style="text-align: center;">${item.selectedSize || '-'}</td>
                                    <td style="text-align: center;">${item.qty || 1}</td>
                                    <td style="text-align: right;">₹${(Number(item.price) || 0).toFixed(2)}</td>
                                    <td style="text-align: right; font-weight: 600;">₹${((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals-section">
                        <div class="total-row"><span>Subtotal:</span> <span>₹${(order.items ? order.items.reduce((s,i) => s + ((Number(i.price) || 0) * (Number(i.qty) || 1)), 0) : (order.totalAmount || 0)).toFixed(2)}</span></div>
                        ${order.couponCode ? `<div class="total-row" style="color: #059669;"><span>Discount (${order.couponCode}):</span> <span>-₹${(order.discountAmount || 0).toFixed(2)}</span></div>` : ''}
                        <div class="total-row"><span>Shipping Fee:</span> <span>${(order.shippingFee || 0) === 0 ? 'FREE' : '₹' + (order.shippingFee || 0).toFixed(2)}</span></div>
                        <div class="total-row grand"><span>Grand Total:</span> <span>₹${(order.totalAmount || 0).toFixed(2)}</span></div>
                    </div>
                    
                    <div class="footer">
                        <strong>Thank you for shopping with Vastra Kuteer!</strong><br/>
                        For returns or exchanges, please retain this invoice and visit vastrakuteer.in/policy. This is a computer generated invoice and does not require a physical signature.
                    </div>
                </div>
            </body></html>
        `;
        
        win.document.write(printContent);
        win.document.close();
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setError('');
        if (addresses.length >= 5) {
            setError('You can only add up to 5 addresses.');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/user/address`, {
                email: user.email,
                address: newAddress
            });
            setAddresses(res.data);
            setShowAddForm(false);
            setNewAddress({ street: '', city: '', state: '', zip: '', phone: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add address');
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            const res = await axios.post(`${API_URL}/api/user/delete-address`, {
                email: user.email,
                addressId: id
            });
            setAddresses(res.data);
        } catch (err) {
            console.error('Failed to delete address', err);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 flex items-center space-x-6 border-l-4 border-vastra-pink">
                    <div className="bg-pink-50 p-4 rounded-full">
                        <User className="h-10 w-10 text-vastra-pink" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">{user.fullName}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                            {user.role} Account
                        </span>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 border border-vastra-border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-vastra-teal" />
                            <GradientText text="Delivery Addresses" />
                            <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{addresses.length}/5 Used</span>
                        </h2>
                        {addresses.length < 5 && !showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center text-sm font-medium text-vastra-pink hover:text-pink-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add New Address
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {showAddForm && (
                        <div className="mb-8 bg-vastra-card/60 p-6 rounded-xl border border-vastra-border">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                <GradientText text="Add New Address" />
                            </h3>
                            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                        value={newAddress.street}
                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="City"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.zip}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                />
                                <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-vastra-teal text-white rounded-lg hover:bg-teal-700 shadow-md transition-all"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border border-vastra-border rounded-xl p-5 hover:border-vastra-teal transition-colors relative group bg-vastra-bg">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Delete Address"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="bg-vastra-card p-2 rounded-lg">
                                        <MapPin className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{addr.city}, {addr.state}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.street}</p>
                                        <p className="text-gray-500 text-xs mt-2 font-mono">ZIP: {addr.zip}</p>
                                        <p className="text-gray-500 text-xs mt-1">Ph: {addr.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {addresses.length === 0 && !showAddForm && (
                            <div className="col-span-1 md:col-span-2 text-center py-10 bg-vastra-card/40 rounded-xl border border-dashed border-vastra-border">
                                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No addresses saved yet.</p>
                                <button onClick={() => setShowAddForm(true)} className="text-vastra-pink font-medium hover:underline mt-2">Add your first address</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Refer & Earn Section */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 border border-vastra-border mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Share2 className="h-5 w-5 mr-2 text-vastra-pink" />
                            <GradientText text="Refer & Earn" />
                        </h2>
                    </div>

                    <div className="bg-gradient-to-r from-pink-50 to-indigo-50 p-6 rounded-xl border border-pink-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                Invite Friends, Get Rewards! <Gift className="h-5 w-5 text-pink-500" />
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Share your unique link. When they register using your link, they join instantly and you get a special 15% OFF coupon added to your profile!
                            </p>
                            
                            <div className="flex items-center gap-2 max-w-md">
                                <div className="flex-1 bg-white border border-gray-300 rounded-lg p-2 text-sm text-gray-600 overflow-hidden break-all">
                                    {window.location.origin}/register?ref={user?.referralCode || 'PENDING'}
                                </div>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.referralCode}`);
                                        alert('Referral Link Copied!');
                                    }}
                                    className="bg-vastra-teal text-white p-2 rounded-lg hover:bg-teal-700 transition"
                                >
                                    <Copy className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full md:w-64">
                            <div className="text-center mb-3">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Earned Rewards</span>
                            </div>
                            {user?.earnedCoupons?.length > 0 ? (
                                <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                    {user.earnedCoupons.map((coupon, i) => (
                                        <li key={i} className="bg-green-50 border border-green-200 text-green-700 font-mono text-center text-sm p-2 rounded">
                                            {coupon}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-4 text-gray-400 text-sm">
                                    No rewards yet. Start referring!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 border border-vastra-border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <Package className="h-5 w-5 mr-2 text-vastra-teal" />
                            <GradientText text="Order History" />
                            <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{orders.length} Orders</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border border-vastra-border rounded-xl p-5 hover:border-vastra-teal transition-colors flex flex-col md:flex-row justify-between items-start md:items-center bg-white shadow-sm">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center space-x-3 mb-1">
                                        <span className="font-mono font-bold text-gray-900">#{order._id.substring(0, 8).toUpperCase()}</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            {order.isPaid ? 'Paid' : 'Prepaid'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm font-semibold text-gray-700 mt-2">Total: ₹{(order.totalAmount || 0).toFixed(2)} <span className="text-xs text-gray-400 font-normal">({(order.items || []).length} items)</span></p>
                                </div>
                                <button 
                                    onClick={() => handleDownloadInvoice(order)}
                                    className="flex items-center space-x-2 bg-gray-50 hover:bg-vastra-teal/10 text-gray-700 hover:text-vastra-teal border border-gray-200 hover:border-vastra-teal px-4 py-2 rounded-lg transition-all font-medium text-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Download Invoice</span>
                                </button>
                            </div>
                        ))}
                        
                        {orders.length === 0 && (
                            <div className="col-span-1 text-center py-10 bg-vastra-card/40 rounded-xl border border-dashed border-vastra-border">
                                <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">You haven't placed any orders yet.</p>
                                <Link to="/shop" className="inline-block mt-3 px-4 py-2 bg-vastra-teal text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition">Start Shopping</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/home" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Profile;
