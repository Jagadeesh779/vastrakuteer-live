import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GradientText from '../components/GradientText';
import { API_URL } from '../config';
import { Plus, Edit, Trash2, X, Check, Search, Box, Grid, ShoppingBag, Home, Users, ShieldCheck, User, MessageSquare, Star, Download, Copy, Mail, Bell, Printer, Upload, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products'); // 'products', 'orders', 'analytics', 'users'
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]); // New state for orders
    const [analyticsData, setAnalyticsData] = useState([]); // Daily sales
    const [categoryStock, setCategoryStock] = useState([]); // Category stock counts
    const [storeStats, setStoreStats] = useState({ totalItems: 0, totalProducts: 0, totalValue: 0 }); // Store Overview
    const [searchQuery, setSearchQuery] = useState(''); // Product Search Query
    const [users, setUsers] = useState([]);
    const [expandedDay, setExpandedDay] = useState(null); // Expanded day in Daily Sales
    const [newOrderCount, setNewOrderCount] = useState(0); // Badge count for new orders
    const lastOrderCount = useRef(null); // Tracks last known order count for polling

    // Modal states
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false); // Quick Sell Modal

    // Selection states
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(null);

    // Form data
    const [productForm, setProductForm] = useState({
        material: '', pattern: '', occasion: '', countryOfOrigin: 'India',
        weavingRegion: '', fabricCare: '', isHandloom: true,
        showOnHome: false, showOnShop: true, showOnCollections: true,
        rating: 4.5, reviews: 0, count: 10, images: []
    });
    const [categoryForm, setCategoryForm] = useState({
        name: '', image: '', description: '', showOnHome: false, showOnShop: true, showOnCollections: true
    });
    // Quick Sell Form
    const [sellForm, setSellForm] = useState({
        size: 'M',
        qty: 1,
        price: 0
    });

    // Order Details Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [deliveryForm, setDeliveryForm] = useState({ courierName: '', trackingNumber: '', currentLocation: '' });

    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    // ── New Feature States ────────────────────────────────────────────────────
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [emailTarget, setEmailTarget] = useState(null); // { email, fullName }
    const [emailForm, setEmailForm] = useState({ subject: '', message: '' });
    const [emailSending, setEmailSending] = useState(false);

    const [userOrdersModal, setUserOrdersModal] = useState(null); // user object
    const [userOrdersList, setUserOrdersList] = useState([]);

    const [csvImporting, setCsvImporting] = useState(false);
    const [csvResult, setCsvResult] = useState(null);
    const csvInputRef = useRef();

    const [notifications, setNotifications] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);

    const addNotif = (msg, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [{ id, msg, type, time: new Date() }, ...prev]);
    };
    // ─────────────────────────────────────────────────────────────────────────

    // Check admin role
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            navigate('/login');
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const prodRes = await axios.get(`${API_URL}/api/products`);
            setProducts(prodRes.data);

            // Fetch Orders (Protected - Cookie handled automatically)
            const ordersRes = await axios.get(`${API_URL}/api/orders`);
            setOrders(ordersRes.data);

            // Fetch Analytics
            const analyticsRes = await axios.get(`${API_URL}/api/orders/analytics/daily`);
            setAnalyticsData(analyticsRes.data);

            // Fetch Users
            const usersRes = await axios.get(`${API_URL}/api/auth/users`);
            setUsers(usersRes.data);

            // Calculate Category Stock & Store Stats
            const stockMap = {};
            let totalItems = 0;
            let totalValue = 0;

            prodRes.data.forEach(p => {
                const cat = p.category || 'Uncategorized';
                if (!stockMap[cat]) stockMap[cat] = { name: cat, count: 0, items: 0 };

                const count = p.count || 0;
                stockMap[cat].count += count;
                stockMap[cat].items += 1;

                totalItems += count;
                totalValue += (p.price * count);
            });
            setCategoryStock(Object.values(stockMap));
            setStoreStats({
                totalItems,
                totalProducts: prodRes.data.length,
                totalValue
            });

        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_URL}/api/auth/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Change ${user.fullName}'s role to "${newRole}"?`)) return;
        try {
            const res = await axios.put(`${API_URL}/api/auth/users/${user._id}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: res.data.role } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update role');
        }
    };

    // ── Duplicate Product ────────────────────────────────────────────────────
    const handleDuplicateProduct = async (product) => {
        try {
            await axios.post(`${API_URL}/api/admin/duplicate-product/${product._id}`);
            addNotif(`✅ "${product.name}" duplicated!`, 'success');
            fetchData();
        } catch (err) {
            addNotif('❌ Failed to duplicate product', 'error');
        }
    };

    // ── Export Orders CSV ────────────────────────────────────────────────────
    const handleExportOrders = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'];
        const rows = orders.map(o => [
            o._id.slice(-6).toUpperCase(),
            o.shippingAddress?.fullName || o.user?.fullName || 'Guest',
            o.user?.email || '',
            o.items.map(i => `${i.name} x${i.qty}`).join(' | '),
            `₹${o.totalAmount}`,
            o.status,
            new Date(o.createdAt).toLocaleDateString('en-IN')
        ]);
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
        URL.revokeObjectURL(url);
        addNotif('📥 Orders exported to CSV!', 'success');
    };

    // ── Print Shipping Label ─────────────────────────────────────────────────
    const handlePrintLabel = (order) => {
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head><title>Shipping Label</title>
            <style>body{font-family:Georgia,serif;padding:30px;max-width:400px;}
            h2{color:#065f46;}.box{border:2px solid #000;padding:15px;border-radius:8px;margin:10px 0;}
            .label{font-size:11px;color:#666;}.val{font-weight:bold;font-size:14px;}
            </style></head><body onload="window.print()">
            <h2>📦 Vastra Kuteer — Shipping Label</h2>
            <div class="box"><div class="label">Order ID</div><div class="val">#${order._id.slice(-6).toUpperCase()}</div></div>
            <div class="box">
                <div class="label">Ship To</div>
                <div class="val">${order.shippingAddress?.fullName || order.user?.fullName || 'Customer'}</div>
                <div>${order.shippingAddress?.address || ''}</div>
                <div>${order.shippingAddress?.city || ''} ${order.shippingAddress?.postalCode || ''}</div>
                <div>${order.shippingAddress?.country || 'India'}</div>
                <div>${order.shippingAddress?.phone || ''}</div>
            </div>
            <div class="box">
                <div class="label">Items</div>
                ${order.items.map(i => `<div class="val">${i.name} (${i.selectedSize || '-'}) x${i.qty}</div>`).join('')}
                <div class="label" style="margin-top:8px;">Total: <strong>₹${order.totalAmount}</strong></div>
            </div>
            ${order.deliveryInfo?.trackingNumber ? `<div class="box"><div class="label">AWB</div><div class="val">${order.deliveryInfo.courierName || ''}: ${order.deliveryInfo.trackingNumber}</div></div>` : ''}
            </body></html>
        `);
        win.document.close();
    };

    // ── Send Email to User ───────────────────────────────────────────────────
    const openEmailModal = (user) => {
        setEmailTarget(user);
        setEmailForm({ subject: '', message: '' });
        setIsEmailModalOpen(true);
    };
    const handleSendEmail = async (e) => {
        e.preventDefault();
        setEmailSending(true);
        try {
            await axios.post(`${API_URL}/api/admin/send-email`, {
                to: emailTarget.email, subject: emailForm.subject, message: emailForm.message
            });
            addNotif(`✅ Email sent to ${emailTarget.fullName}!`, 'success');
            setIsEmailModalOpen(false);
        } catch (err) {
            addNotif('❌ Failed to send email', 'error');
        } finally {
            setEmailSending(false);
        }
    };

    // ── User Order History ───────────────────────────────────────────────────
    const openUserOrdersModal = async (user) => {
        setUserOrdersModal(user);
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/myorders/${user._id}`);
            setUserOrdersList(data);
        } catch { setUserOrdersList([]); }
    };

    // ── CSV Import ───────────────────────────────────────────────────────────
    const handleCsvImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCsvImporting(true); setCsvResult(null);
        const formData = new FormData(); formData.append('file', file);
        try {
            const { data } = await axios.post(`${API_URL}/api/admin/import-csv`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCsvResult({ success: true, count: data.imported });
            addNotif(`✅ ${data.imported} products imported from CSV!`, 'success');
            fetchData();
        } catch (err) {
            setCsvResult({ success: false, error: err.response?.data?.error || err.message });
            addNotif('❌ CSV import failed', 'error');
        } finally {
            setCsvImporting(false);
            e.target.value = '';
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Order Notification Polling ---
    useEffect(() => {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        const pollOrders = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/orders/count`);
                const count = res.data.count;

                if (lastOrderCount.current === null) {
                    // First load — set baseline, don't notify
                    lastOrderCount.current = count;
                } else if (count > lastOrderCount.current) {
                    const diff = count - lastOrderCount.current;
                    lastOrderCount.current = count;

                    // Update badge
                    setNewOrderCount(prev => prev + diff);

                    // Fire browser notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('🛒 New Order Received!', {
                            body: `You have ${diff} new order${diff > 1 ? 's' : ''} on Vastra Kuteer.`,
                            icon: '/vite.svg'
                        });
                    }
                }
            } catch (err) {
                // Silently fail (user may not be admin)
            }
        };

        pollOrders(); // Run immediately on mount
        const interval = setInterval(pollOrders, 30000); // Then every 30s
        return () => clearInterval(interval);
    }, []);

    // Helper for input changes
    const handleProductChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;

        // Convert numeric fields
        if (['price', 'originalPrice', 'rating', 'reviews', 'count'].includes(name)) {
            finalValue = value === '' ? '' : Number(value);
        }

        const updated = { ...productForm, [name]: finalValue };

        // Auto-sync isSoldOut when count changes directly
        if (name === 'count' && finalValue !== '') {
            updated.isSoldOut = Number(finalValue) <= 0;
        }

        setProductForm(updated);
    };
    const handleCategoryChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCategoryForm({
            ...categoryForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSizeChange = (size, value) => {
        const currentSizes = productForm.sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, Saree: 0 };
        const newSizes = { ...currentSizes, [size]: Math.max(0, Number(value) || 0) };
        const totalCount = Object.values(newSizes).reduce((a, b) => a + b, 0);

        setProductForm({
            ...productForm,
            sizes: newSizes,
            count: totalCount,
            isSoldOut: totalCount <= 0  // auto-derive: no stock = sold out
        });
    };

    // File Upload Handler (Reusable)
    const handleImageUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        try {
            // Let axios/browser set the correct Content-Type with boundary for FormData
            const { data } = await axios.post(`${API_URL}/api/upload`, uploadData);

            if (type === 'product') {
                setProductForm(prev => ({ ...prev, image: data.filePath }));
            } else if (type === 'gallery') {
                setProductForm(prev => {
                    const arr = prev.images || [];
                    return { ...prev, images: [...arr, data.filePath], image: arr.length === 0 && !prev.image ? data.filePath : prev.image };
                });
            } else {
                setCategoryForm(prev => ({ ...prev, image: data.filePath }));
            }
            alert(`File uploaded: ${data.filePath}`);
            setUploading(false);
            setUploading(false);
        } catch (error) {
            console.error('Error uploading file', error);
            setUploading(false);
            const errorMsg = error.response?.data?.msg || error.message || 'Failed to upload image';
            alert(`Upload failed: ${errorMsg}`);
        }
    };

    // --- Product Handlers ---
    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            // Create a payload copy
            const payload = { ...productForm };

            // If sizes sum to 0, remove them to prevent backend from overwriting count with 0
            const totalSizeCount = payload.sizes ? Object.values(payload.sizes).reduce((a, b) => a + Number(b), 0) : 0;
            if (totalSizeCount === 0) {
                delete payload.sizes;
            }

            if (currentProduct) {
                await axios.put(`${API_URL}/api/products/${currentProduct._id}`, payload);
            } else {
                await axios.post(`${API_URL}/api/products`, payload);
            }
            fetchData();
            closeProductModal();
        } catch (err) {
            console.error(err);
            alert('Error saving product');
        }
    };

    const handleProductDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/api/products/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    const toggleSoldOut = async (product) => {
        try {
            await axios.put(`${API_URL}/api/products/${product._id}`, { isSoldOut: !product.isSoldOut });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDeleteReview = async (productId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await axios.delete(`${API_URL}/api/products/${productId}/reviews/${reviewId}`);
            fetchData();
            alert('Review deleted');
        } catch (err) {
            console.error(err);
            alert('Failed to delete review');
        }
    };

    // --- Category Handlers ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCategory) {
                await axios.put(`${API_URL}/api/categories/${currentCategory._id}`, categoryForm);
            } else {
                await axios.post(`${API_URL}/api/categories`, categoryForm);
            }
            fetchData();
            closeCategoryModal();
        } catch (err) {
            console.error(err);
            alert('Error saving category');
        }
    };

    const handleCategoryDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`${API_URL}/api/categories/${id}`);
                fetchData();
            } catch (err) { console.error(err); }
        }
    };

    // --- Order Handlers ---
    const updateOrderStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/api/orders/${id}/status`, { status });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    // Modal Controls
    const openProductModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setProductForm({
                ...product,
                images: product.images || [],
                count: product.count !== undefined ? product.count : 10
            });
        } else {
            setCurrentProduct(null);
            setProductForm({
                brand: 'Vastra Kuteer', name: '', price: '', originalPrice: '', image: '', images: [], category: '', description: '',
                material: '', pattern: '', occasion: '', countryOfOrigin: 'India',
                weavingRegion: '', fabricCare: '', isHandloom: true,
                showOnHome: false, showOnShop: true, showOnCollections: true,
                rating: 4.5, reviews: 0, count: 10, sizes: {}
            });
        }
        setIsProductModalOpen(true);
    };
    const closeProductModal = () => {
        setIsProductModalOpen(false);
        setCurrentProduct(null);
    };

    const openCategoryModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setCategoryForm(category);
        } else {
            setCurrentCategory(null);
            setCategoryForm({ name: '', image: '', description: '', showOnHome: false, showOnShop: true, showOnCollections: true });
        }
        setIsCategoryModalOpen(true);
    };

    const closeCategoryModal = () => {
        setIsCategoryModalOpen(false);
        setCurrentCategory(null);
    };

    // Quick Sell Modal
    const openSellModal = (product) => {
        setCurrentProduct(product);
        setSellForm({
            size: 'M',
            qty: 1,
            price: product.price // Default to product price
        });
        setIsSellModalOpen(true);
    };

    const closeSellModal = () => {
        setIsSellModalOpen(false);
        setCurrentProduct(null);
    };

    const handleOfflineSale = async (e) => {
        e.preventDefault();
        try {
            const orderData = {
                user: null, // Guest/Admin
                items: [{
                    product: currentProduct._id,
                    name: currentProduct.name,
                    qty: Number(sellForm.qty),
                    price: Number(sellForm.price), // Use custom price
                    image: currentProduct.image,
                    selectedSize: sellForm.size,
                    productCode: currentProduct.productCode
                }],
                totalAmount: Number(sellForm.price) * Number(sellForm.qty), // Calculate total with custom price
                shippingAddress: {
                    address: 'In Store',
                    city: 'N/A',
                    postalCode: 'N/A',
                    country: 'India'
                },
                paymentResult: {
                    id: 'OFFLINE_SALE',
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: 'admin@vastrakuteer.com'
                },
                status: 'Delivered' // Immediately delivered
            };

            await axios.post(`${API_URL}/api/orders`, orderData);
            alert('Offline sale recorded successfully!');
            fetchData(); // Refresh stock and analytics
            closeSellModal();
        } catch (err) {
            console.error(err);
            alert('Failed to record sale');
        }
    };

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setDeliveryForm({
            courierName: order.deliveryInfo?.courierName || '',
            trackingNumber: order.deliveryInfo?.trackingNumber || '',
            currentLocation: order.deliveryInfo?.currentLocation || ''
        });
        setIsOrderModalOpen(true);
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
        setIsOrderModalOpen(false);
    };

    const saveDeliveryInfo = async () => {
        try {
            await axios.put(`${API_URL}/api/orders/${selectedOrder._id}/delivery`, deliveryForm);
            alert('Delivery info saved!');
            fetchData();
            // Update selectedOrder locally so fields stay filled
            setSelectedOrder(prev => ({ ...prev, deliveryInfo: { ...deliveryForm, updatedAt: new Date() } }));
        } catch (err) {
            console.error(err);
            alert('Failed to save delivery info');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[90%] mx-auto px-4">
                {/* Header Container */}
                <div className="flex justify-between items-end mb-8 relative z-10">

                    {/* Notification Bell */}
                    <div className="absolute top-0 right-0 z-50">
                        <div className="relative">
                            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <Bell className="h-6 w-6 text-gray-600" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {notifications.length > 9 ? '9+' : notifications.length}
                                    </span>
                                )}
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 top-10 w-72 rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50" style={{ background: 'rgba(250,249,255,0.98)', backdropFilter: 'blur(12px)' }}>
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                        <span className="font-bold text-sm text-gray-800">Notifications</span>
                                        <button onClick={() => setNotifications([])} className="text-xs text-gray-400 hover:text-gray-600">Clear all</button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-xs text-gray-400">No notifications</div>
                                    ) : (
                                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                                            {notifications.map(n => (
                                                <div key={n.id} className="px-4 py-3 text-sm">
                                                    <p className="text-gray-800">{n.msg}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{n.time.toLocaleTimeString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Left Side: Title + Tabs */}
                    <div className="flex flex-col gap-6 w-full md:w-auto overflow-hidden">
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">
                            <GradientText text="Admin Dashboard" />
                        </h1>

                        {/* Tabs */}
                        <div className="flex space-x-6">
                            <button
                                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'products' ? 'text-vastra-teal' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('products')}
                            >
                                Products
                                {activeTab === 'products' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vastra-teal"></span>}
                            </button>
                            <button
                                className={`pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-1 ${activeTab === 'orders' ? 'text-vastra-teal' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => { setActiveTab('orders'); setNewOrderCount(0); }}
                            >
                                Orders
                                {newOrderCount > 0 && (
                                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
                                        {newOrderCount}
                                    </span>
                                )}
                                {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vastra-teal"></span>}
                            </button>
                            <button
                                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'analytics' ? 'text-vastra-teal' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('analytics')}
                            >
                                Analytics
                                {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vastra-teal"></span>}
                            </button>
                            <button
                                className={`pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-1 ${activeTab === 'users' ? 'text-vastra-teal' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('users')}
                            >
                                <Users className="h-4 w-4" />
                                <span className="hidden sm:inline">Users</span>
                                <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-vastra-teal rounded-full">{users.length}</span>
                                {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vastra-teal"></span>}
                            </button>
                            <button
                                className={`pb-4 px-2 font-medium text-sm transition-colors relative flex items-center gap-1 ${activeTab === 'reviews' ? 'text-vastra-teal' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Reviews</span>
                                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vastra-teal"></span>}
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 pb-4">
                        {activeTab === 'products' ? (
                            <>
                                {/* Hidden CSV input */}
                                <input type="file" accept=".csv" ref={csvInputRef} onChange={handleCsvImport} style={{ display: 'none' }} />
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by Code/Name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md focus:ring-vastra-teal focus:border-vastra-teal w-48 text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => csvInputRef.current?.click()}
                                    disabled={csvImporting}
                                    className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors text-sm border border-blue-200 flex items-center gap-1"
                                    title="Import Products from CSV"
                                >
                                    <Upload className="h-4 w-4" />
                                    {csvImporting ? 'Importing...' : 'CSV Import'}
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Are you sure you want to clear ALL products? This cannot be undone.')) {
                                            try { await axios.post(`${API_URL}/api/products/clear`); fetchData(); } catch (e) { console.error(e); }
                                        }
                                    }}
                                    className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors text-sm border border-red-200"
                                >
                                    Clear Data
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('This will replace all products with dummy data. Continue?')) {
                                            try { await axios.post(`${API_URL}/api/products/seed`); fetchData(); } catch (e) { console.error(e); }
                                        }
                                    }}
                                    className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors text-sm border border-gray-200"
                                >
                                    Reset Data
                                </button>
                                <button
                                    onClick={() => openProductModal()}
                                    className="bg-vastra-teal text-white px-3 py-1.5 rounded-md flex items-center hover:bg-teal-700 transition-colors text-sm font-medium shrink-0 shadow-sm"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Product
                                </button>
                            </>
                        ) : activeTab === 'orders' ? (
                            <>
                                <button
                                    onClick={handleExportOrders}
                                    className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md flex items-center hover:bg-green-100 transition-colors text-sm border border-green-200 gap-1"
                                >
                                    <Download className="h-4 w-4" /> Export CSV
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => openCategoryModal()}
                                className="bg-vastra-teal text-white px-3 py-1.5 rounded-md flex items-center hover:bg-teal-700 transition-colors text-sm font-medium shrink-0 shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add Category
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative z-0 mt-[-1px]">
                    {activeTab === 'products' && (
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* ... Product Table Content ... */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.filter(product => {
                                    if (!searchQuery) return true;
                                    const query = searchQuery.toLowerCase();
                                    return (
                                        (product.productCode && product.productCode.toLowerCase().includes(query)) ||
                                        product.name.toLowerCase().includes(query) ||
                                        product.brand.toLowerCase().includes(query)
                                    );
                                }).map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.brand}</div>
                                                    <div className="text-sm text-gray-500">{product.name}</div>
                                                    {product.productCode && <div className="text-xs text-gray-400 font-mono mt-1">{product.productCode}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">₹{product.price}</div>
                                            {product.originalPrice && <div className="text-xs text-gray-500 line-through">₹{product.originalPrice}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-900 font-medium">{product.count !== undefined ? product.count : 'N/A'}</span>
                                                {product.count !== undefined && product.count < 5 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800" title="Less than 5 items remaining">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <Home className={`h-4 w-4 ${product.showOnHome ? 'text-green-500' : 'text-gray-300'}`} title="Home" />
                                                <ShoppingBag className={`h-4 w-4 ${product.showOnShop ? 'text-green-500' : 'text-gray-300'}`} title="Shop" />
                                                <Grid className={`h-4 w-4 ${product.showOnCollections ? 'text-green-500' : 'text-gray-300'}`} title="Collections" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Status is derived from count as ground truth.
                                                isSoldOut flag is the stored value, but count overrides it visually */}
                                            <button
                                                onClick={() => toggleSoldOut(product)}
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    (product.count !== undefined ? product.count <= 0 : product.isSoldOut)
                                                        ? 'bg-red-100 text-red-800'
                                                        : product.count !== undefined && product.count < 5
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-green-100 text-green-800'
                                                } cursor-pointer`}
                                                title="Click to toggle sold out status"
                                            >
                                                {(product.count !== undefined ? product.count <= 0 : product.isSoldOut)
                                                    ? 'Sold Out'
                                                    : product.count !== undefined && product.count < 5
                                                        ? 'Low Stock'
                                                        : 'In Stock'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openSellModal(product)} className="text-green-600 hover:text-green-900 mr-3" title="Quick Sell"><ShoppingBag className="h-5 w-5" /></button>
                                            <button onClick={() => handleDuplicateProduct(product)} className="text-purple-500 hover:text-purple-800 mr-3" title="Duplicate"><Copy className="h-4 w-4" /></button>
                                            <button onClick={() => openProductModal(product)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit className="h-5 w-5" /></button>
                                            <button onClick={() => handleProductDelete(product._id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            No products found. Click "Add Product" to create one.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'orders' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order._id.slice(-6).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.shippingAddress?.fullName || order.user?.fullName || 'Guest'}
                                                <div className="text-xs text-gray-400">{order.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₹{order.totalAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    <option value="Placed">Placed</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out For Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {order.items.slice(0, 3).map((item, idx) => (
                                                        <img key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={item.image} alt={item.name} title={item.name} />
                                                    ))}
                                                    {order.items.length > 3 && (
                                                        <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                                                            +{order.items.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openOrderModal(order)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-full mr-2"
                                                    title="View Details"
                                                >
                                                    <Search className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handlePrintLabel(order)}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-50 p-2 rounded-full"
                                                    title="Print Shipping Label"
                                                >
                                                    <Printer className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                No orders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="p-6 space-y-8">
                            {/* Store Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm font-medium uppercase">Total Inventory</div>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">{storeStats.totalItems}</span>
                                        <span className="ml-2 text-sm text-gray-500">Items</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm font-medium uppercase">Total Products</div>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">{storeStats.totalProducts}</span>
                                        <span className="ml-2 text-sm text-gray-500">Listings</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="text-gray-500 text-sm font-medium uppercase">Total Value</div>
                                    <div className="mt-2 flex items-baseline">
                                        <span className="text-3xl font-extrabold text-gray-900">₹{storeStats.totalValue.toLocaleString()}</span>
                                        <span className="ml-2 text-sm text-gray-500">Est. Revenue</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Revenue Bar Chart ─────────────────────────────────────────────── */}
                            {(() => {
                                const chartData = [...analyticsData].slice(0, 14).reverse().map(d => ({
                                    date: d.date.length > 5 ? d.date.slice(5) : d.date,
                                    Revenue: d.totalSales,
                                    Orders: d.orderCount,
                                }));

                                const totalRevenue = chartData.reduce((s, d) => s + d.Revenue, 0);
                                const totalOrders = chartData.reduce((s, d) => s + d.Orders, 0);

                                return (
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">📈 Revenue Chart</h3>
                                                <p className="text-xs text-gray-400">Last {chartData.length} days</p>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-teal-500"></span> Revenue (₹)</span>
                                                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-400"></span> Orders</span>
                                            </div>
                                        </div>

                                        {chartData.length === 0 ? (
                                            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                                                No sales data yet — chart will appear once orders come in.
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={4}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                                    <YAxis
                                                        yAxisId="revenue"
                                                        orientation="left"
                                                        tick={{ fontSize: 11, fill: '#6B7280' }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                                                        width={55}
                                                    />
                                                    <YAxis
                                                        yAxisId="orders"
                                                        orientation="right"
                                                        tick={{ fontSize: 11, fill: '#D97706' }}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        width={30}
                                                        allowDecimals={false}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                                                        formatter={(value, name) => name === 'Revenue' ? [`₹${value.toLocaleString('en-IN')}`, 'Revenue'] : [value, 'Orders']}
                                                    />
                                                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                                    <Bar yAxisId="revenue" dataKey="Revenue" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={40} />
                                                    <Bar yAxisId="orders" dataKey="Orders" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={24} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}

                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400">Total Revenue</div>
                                                <div className="text-base font-bold text-teal-600">₹{totalRevenue.toLocaleString('en-IN')}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400">Total Orders</div>
                                                <div className="text-base font-bold text-amber-500">{totalOrders}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-gray-400">Avg / Day</div>
                                                <div className="text-base font-bold text-gray-700">₹{chartData.length ? Math.round(totalRevenue / chartData.length).toLocaleString('en-IN') : 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── Low Stock Alerts ─────────────────────────────────────────────── */}
                            {(() => {
                                const lowStockItems = products.filter(p => p.count !== undefined && p.count < 5);
                                if (lowStockItems.length === 0) return null;
                                return (
                                    <div className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-red-900">Low Stock Alerts</h3>
                                                <p className="text-xs text-red-600">These items have fewer than 5 units left and need to be restocked.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {lowStockItems.map(item => (
                                                <div key={item._id} className="bg-white p-4 rounded-lg border border-red-100 flex items-center gap-4 cursor-pointer hover:bg-red-50 transition-colors" onClick={() => { setActiveTab('products'); }}>
                                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{item.brand}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-red-600">{item.count}</div>
                                                        <div className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Left</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Stock by Category */}
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Stock by Category</h3>
                                    <div className="space-y-4">
                                        {categoryStock.map((cat) => (
                                            <div key={cat.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <div className="font-medium text-gray-900">{cat.name}</div>
                                                    <div className="text-xs text-gray-500">{cat.items} Products</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-vastra-teal">{cat.count}</div>
                                                    <div className="text-xs text-gray-500">Total Items</div>
                                                </div>
                                            </div>
                                        ))}
                                        {categoryStock.length === 0 && <p className="text-gray-500">No stock data available.</p>}
                                    </div>
                                </div>

                                {/* Daily Sales */}
                                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Sales Performance</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {analyticsData.map((day) => (
                                                    <React.Fragment key={day.date}>
                                                        {/* Summary Row */}
                                                        <tr
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                                                        >
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 flex items-center gap-1">
                                                                <span className="text-gray-400 text-xs">{expandedDay === day.date ? '▲' : '▼'}</span>
                                                                {day.date}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{day.orderCount}</td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">₹{day.totalSales}</td>
                                                        </tr>
                                                        {/* Expanded Product Rows */}
                                                        {expandedDay === day.date && day.products && day.products.length > 0 && (
                                                            <tr>
                                                                <td colSpan="3" className="px-3 py-2 bg-gray-50">
                                                                    <div className="space-y-2">
                                                                        {day.products.map((item, idx) => (
                                                                            <div key={idx} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100">
                                                                                {item.image ? (
                                                                                    <img
                                                                                        src={item.image}
                                                                                        alt={item.name}
                                                                                        className="h-12 w-12 rounded-md object-cover flex-shrink-0 border border-gray-200"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                                                        <ShoppingBag className="h-5 w-5 text-gray-400" />
                                                                                    </div>
                                                                                )}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                                                                                    <div className="text-xs text-gray-500">
                                                                                        {item.selectedSize && <span className="mr-2">Size: <span className="font-medium">{item.selectedSize}</span></span>}
                                                                                        Qty: <span className="font-medium">{item.qty}</span>
                                                                                        {item.productCode && <span className="ml-2 font-mono text-indigo-500">{item.productCode}</span>}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-sm font-semibold text-vastra-teal whitespace-nowrap">
                                                                                    ₹{item.price}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                                {analyticsData.length === 0 && (
                                                    <tr>
                                                        <td colSpan="3" className="px-3 py-4 text-center text-sm text-gray-500">No sales data yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-vastra-teal/10 flex items-center justify-center text-vastra-teal font-bold text-sm">
                                                        {user.fullName?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openUserOrdersModal(user)}
                                                    title="View Orders"
                                                    className="text-teal-600 hover:text-teal-900 mr-2 p-1 rounded hover:bg-teal-50"
                                                >
                                                    <ShoppingBag className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEmailModal(user)}
                                                    title="Send Email"
                                                    className="text-blue-500 hover:text-blue-800 mr-2 p-1 rounded hover:bg-blue-50"
                                                >
                                                    <Mail className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleRole(user)}
                                                    title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                                    className="text-purple-600 hover:text-purple-900 mr-2 p-1 rounded hover:bg-purple-50"
                                                >
                                                    <ShieldCheck className="h-5 w-5" />
                                                </button>
                                                {user._id !== 'admin_static_id' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.fullName)}
                                                        title="Delete User"
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div >

            {/* Product Modal */}
            {
                isProductModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{currentProduct ? 'Edit Product' : 'Add Product'}</h3>
                                        <button onClick={closeProductModal}><X className="h-6 w-6 text-gray-400" /></button>
                                    </div>
                                    <form onSubmit={handleProductSubmit} className="space-y-4">
                                        {/* Product Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                                <input type="text" name="brand" value={productForm.brand} onChange={handleProductChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                                <input type="text" name="name" value={productForm.name} onChange={handleProductChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Product Code (SKU)</label>
                                            <input type="text" name="productCode" value={productForm.productCode || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. VK-TOP-001" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Price</label>
                                                <input type="number" name="price" value={productForm.price} onChange={handleProductChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Original Price</label>
                                                <input type="number" name="originalPrice" value={productForm.originalPrice} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Size Stock Distribution (Optional)
                                                </label>
                                                <div className="grid grid-cols-6 gap-2 mb-3">
                                                    {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Saree'].map((size) => (
                                                        <div key={size}>
                                                            <label className="block text-xs font-medium text-gray-500 text-center">{size}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={productForm.sizes ? productForm.sizes[size] : 0}
                                                                onChange={(e) => handleSizeChange(size, e.target.value)}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-1 text-center text-sm"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {productForm.category && productForm.category.toLowerCase().includes('sarees') ? 'Sarees Count / Total Stock' : 'Total Stock'}
                                                </label>
                                                <input
                                                    type="number"
                                                    name="count"
                                                    min="0"
                                                    value={productForm.count}
                                                    onChange={handleProductChange}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                                                    placeholder="Total stock count (calculated from sizes or entered manually)"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter sizes to auto-calculate total, or enter total directly for non-sized items.
                                                </p>
                                            </div>
                                        </div>


                                        {/* New Product Details Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Material</label>
                                                <input type="text" name="material" value={productForm.material || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Silk" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Pattern</label>
                                                <input type="text" name="pattern" value={productForm.pattern || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Woven" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Occasion</label>
                                                <input type="text" name="occasion" value={productForm.occasion || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Wedding" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Country of Origin</label>
                                                <input type="text" name="countryOfOrigin" value={productForm.countryOfOrigin || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. India" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Weaving Region</label>
                                                <input type="text" name="weavingRegion" value={productForm.weavingRegion || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Kanchipuram" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Fabric Care</label>
                                                <input type="text" name="fabricCare" value={productForm.fabricCare || ''} onChange={handleProductChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="e.g. Dry Clean Only" />
                                            </div>
                                        </div>

                                        <label className="flex items-center space-x-2 cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                name="isHandloom"
                                                checked={productForm.isHandloom}
                                                onChange={handleProductChange}
                                                className="rounded text-vastra-teal focus:ring-vastra-teal h-4 w-4"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Verified Handloom Product</span>
                                        </label>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category</label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={productForm.category || ''}
                                                onChange={handleProductChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                placeholder="Enter category (e.g. Sarees)"
                                                required
                                            />
                                        </div>

                                        {/* Visibility Flags */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 pb-1">Display Options</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnHome"
                                                        checked={productForm.showOnHome}
                                                        onChange={handleProductChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Home</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnShop"
                                                        checked={productForm.showOnShop}
                                                        onChange={handleProductChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Shop</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnCollections"
                                                        checked={productForm.showOnCollections}
                                                        onChange={handleProductChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Collections</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Image</label>
                                            <div className="mt-1 flex items-center space-x-4">
                                                <input type="text" name="image" value={productForm.image} onChange={handleProductChange} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Image URL" />
                                                <span className="text-gray-500">OR</span>
                                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    <span>Upload</span>
                                                    <input type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'product')} accept="image/*" />
                                                </label>
                                            </div>
                                            {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                                            {productForm.image && <img src={productForm.image} alt="Preview" className="h-20 w-20 object-cover mt-2 rounded" />}
                                        </div>

                                        {/* Multi-Image Gallery */}
                                        <div className="mt-4 border-t border-gray-200 pt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Gallery)</label>
                                            <p className="text-xs text-gray-500 mb-4">Add multiple image URLs here to create an image carousel for this product.</p>

                                            <div className="flex gap-2 mb-4">
                                                <input
                                                    type="url"
                                                    id="new-image-url"
                                                    placeholder="Paste image URL here"
                                                    className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const val = e.target.value.trim();
                                                            if (val) {
                                                                setProductForm(prev => {
                                                                    const arr = prev.images || [];
                                                                    return { ...prev, images: [...arr, val], image: arr.length === 0 && !prev.image ? val : prev.image };
                                                                });
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const input = document.getElementById('new-image-url');
                                                        const val = input.value.trim();
                                                        if (val) {
                                                            setProductForm(prev => {
                                                                const arr = prev.images || [];
                                                                return { ...prev, images: [...arr, val], image: arr.length === 0 && !prev.image ? val : prev.image };
                                                            });
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 border border-gray-300"
                                                >
                                                    Add URL
                                                </button>
                                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                                                    <span>Upload File</span>
                                                    <input type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'gallery')} accept="image/*" />
                                                </label>
                                            </div>

                                            {(!productForm.images || productForm.images.length === 0) && productForm.image && (
                                                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mb-4">
                                                    Note: You have a main image set via upload, but no gallery images. Add a URL above to start populating the gallery.
                                                </div>
                                            )}

                                            {productForm.images && productForm.images.length > 0 && (
                                                <div className="grid grid-cols-4 gap-4">
                                                    {productForm.images.map((img, idx) => (
                                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newImages = [...productForm.images];
                                                                        newImages.splice(idx, 1);
                                                                        setProductForm(prev => ({ ...prev, images: newImages }));
                                                                    }}
                                                                    className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            {productForm.image === img && (
                                                                <div className="absolute top-0 left-0 bg-teal-500 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-br">Main</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-5 sm:mt-6">
                                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-vastra-teal text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:text-sm">
                                                Save Product
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div >
                )
            }

            {/* Category Modal */}
            {
                isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{currentCategory ? 'Edit Category' : 'Add Category'}</h3>
                                        <button onClick={closeCategoryModal}><X className="h-6 w-6 text-gray-400" /></button>
                                    </div>
                                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                                            <input type="text" name="name" value={categoryForm.name} onChange={handleCategoryChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea name="description" value={categoryForm.description} onChange={handleCategoryChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                                        </div>

                                        {/* Visibility Flags */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 pb-1">Display Options</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnHome"
                                                        checked={categoryForm.showOnHome}
                                                        onChange={handleCategoryChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Home</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnShop"
                                                        checked={categoryForm.showOnShop}
                                                        onChange={handleCategoryChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Shop</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        name="showOnCollections"
                                                        checked={categoryForm.showOnCollections}
                                                        onChange={handleCategoryChange}
                                                        className="rounded text-vastra-teal focus:ring-vastra-teal"
                                                    />
                                                    <span className="text-sm text-gray-700">Show on Collections</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Image</label>
                                            <div className="mt-1 flex items-center space-x-4">
                                                <input type="text" name="image" value={categoryForm.image} onChange={handleCategoryChange} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Image URL" />
                                                <span className="text-gray-500">OR</span>
                                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                    <span>Upload</span>
                                                    <input type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'category')} accept="image/*" />
                                                </label>
                                            </div>
                                            {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                                            {categoryForm.image && <img src={categoryForm.image} alt="Preview" className="h-20 w-20 object-cover mt-2 rounded" />}
                                        </div>
                                        <div className="mt-5 sm:mt-6">
                                            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-vastra-teal text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:text-sm">
                                                Save Category
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quick Sell Modal */}
            {
                isSellModalOpen && currentProduct && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Sell: {currentProduct.name}</h3>
                                        <button onClick={closeSellModal}><X className="h-6 w-6 text-gray-400" /></button>
                                    </div>
                                    <form onSubmit={handleOfflineSale} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Size</label>
                                            <select
                                                value={sellForm.size}
                                                onChange={(e) => setSellForm({ ...sellForm, size: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                            >
                                                {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Saree'].map(size => (
                                                    <option key={size} value={size}>{size}</option>
                                                ))}
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Available Stock: <span className="font-bold text-gray-900">{sellForm.size === 'Saree' ? (currentProduct.count || 0) : (currentProduct.sizes ? (currentProduct.sizes[sellForm.size] || 0) : 0)}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={sellForm.size === 'Saree' ? (currentProduct.count || 0) : (currentProduct.sizes ? (currentProduct.sizes[sellForm.size] || 0) : 0)}
                                                value={sellForm.qty}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    const maxStock = sellForm.size === 'Saree' ? (currentProduct.count || 0) : (currentProduct.sizes ? (currentProduct.sizes[sellForm.size] || 0) : 0);
                                                    if (val <= maxStock) {
                                                        setSellForm({ ...sellForm, qty: val });
                                                    } else {
                                                        alert(`Cannot sell more than available stock (${maxStock})`);
                                                    }
                                                }}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price (Per Item)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={sellForm.price}
                                                onChange={(e) => setSellForm({ ...sellForm, price: Number(e.target.value) })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                required
                                            />
                                        </div>

                                        <div className="mt-4 bg-gray-50 p-3 rounded space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Price:</span>
                                                <span>₹{sellForm.price}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Qty:</span>
                                                <span>x {sellForm.qty}</span>
                                            </div>
                                            <div className="border-t pt-1 flex justify-between font-bold">
                                                <span>Total:</span>
                                                <span>₹{Number(sellForm.price) * Number(sellForm.qty)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-5 sm:mt-6">
                                            <button
                                                type="submit"
                                                disabled={(currentProduct.sizes ? (currentProduct.sizes[sellForm.size] || 0) : 0) <= 0}
                                                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm ${((currentProduct.sizes ? (currentProduct.sizes[sellForm.size] || 0) : 0) > 0) ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                                            >
                                                Record Sale
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Order Details Modal */}
            {
                isOrderModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeOrderModal}></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                                        <div>
                                            <h3 className="text-xl leading-6 font-semibold text-gray-900">Order Details</h3>
                                            <p className="text-sm text-gray-500 mt-1">ID: #{selectedOrder._id.toUpperCase()}</p>
                                        </div>
                                        <button onClick={closeOrderModal} className="bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors">
                                            <X className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Customer Details */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Shipping Address</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p className="font-bold text-gray-900">{selectedOrder.shippingAddress?.fullName || selectedOrder.user?.fullName || 'Guest'}</p>
                                                <p>{selectedOrder.shippingAddress.street}</p>
                                                <p>{selectedOrder.shippingAddress.address}</p>
                                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                                                <p>{selectedOrder.shippingAddress.country}</p>
                                                <p className="mt-2"><span className="font-medium">Phone:</span> {selectedOrder.shippingAddress.phone || 'N/A'}</p>
                                                <p><span className="font-medium">Email:</span> {selectedOrder.shippingAddress.email || selectedOrder.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Payment & Status</h4>
                                            <div className="text-sm text-gray-600 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Payment Method:</span>
                                                    <span className="font-medium text-gray-900">{selectedOrder.paymentResult?.id === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Payment Status:</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedOrder.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Order Status:</span>
                                                    <span className="font-medium text-vastra-teal">{selectedOrder.status}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                                                    <span className="font-bold text-gray-900">Total Amount:</span>
                                                    <span className="font-bold text-xl text-vastra-teal">₹{selectedOrder.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Order Items ({selectedOrder.items.length})</h4>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedOrder.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 whitespace-nowrap w-16">
                                                                <img src={item.image} alt={item.name} className="h-12 w-12 rounded object-cover" />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                                <div className="text-xs text-gray-500">Size: {item.size}</div>
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                                                                {item.qty} x ₹{item.price}
                                                            </td>
                                                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                                                ₹{item.qty * item.price}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div className="mt-6 border border-blue-100 rounded-lg p-4 bg-blue-50">
                                        <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            🚚 Delivery Info
                                            {selectedOrder.deliveryInfo?.updatedAt && (
                                                <span className="text-xs font-normal text-blue-400 ml-auto">
                                                    Last updated: {new Date(selectedOrder.deliveryInfo.updatedAt).toLocaleString()}
                                                </span>
                                            )}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Courier Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. DTDC, Blue Dart"
                                                    value={deliveryForm.courierName}
                                                    onChange={e => setDeliveryForm(f => ({ ...f, courierName: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-vastra-teal focus:border-vastra-teal"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Tracking Number (AWB)</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 123456789012"
                                                    value={deliveryForm.trackingNumber}
                                                    onChange={e => setDeliveryForm(f => ({ ...f, trackingNumber: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-vastra-teal focus:border-vastra-teal"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Current Location</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Bangalore Hub"
                                                    value={deliveryForm.currentLocation}
                                                    onChange={e => setDeliveryForm(f => ({ ...f, currentLocation: e.target.value }))}
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-vastra-teal focus:border-vastra-teal"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={saveDeliveryInfo}
                                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Save Delivery Info
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-vastra-teal text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={closeOrderModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Email User Modal ─────────────────────────────────────────────────── */}
            {isEmailModalOpen && emailTarget && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Send Email to {emailTarget.fullName}</h3>
                            <button onClick={() => setIsEmailModalOpen(false)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSendEmail} className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">To</label>
                                <input value={emailTarget.email} readOnly className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Subject</label>
                                <input required value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-teal-400 focus:outline-none" placeholder="Subject" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Message</label>
                                <textarea required rows={5} value={emailForm.message} onChange={e => setEmailForm(f => ({ ...f, message: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-teal-400 focus:outline-none" placeholder="Write your message..." />
                            </div>
                            <button type="submit" disabled={emailSending} className="w-full py-2.5 bg-vastra-teal text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors disabled:opacity-60">
                                {emailSending ? 'Sending...' : 'Send Email ✉️'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── User Orders History Modal ─────────────────────────────────────────── */}
            {userOrdersModal && (
                <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Orders — {userOrdersModal.fullName}</h3>
                            <button onClick={() => setUserOrdersModal(null)}><X className="h-5 w-5 text-gray-400" /></button>
                        </div>
                        {userOrdersList.length === 0 ? (
                            <p className="text-gray-400 text-center py-6">No orders found for this user.</p>
                        ) : (
                            <div className="space-y-3">
                                {userOrdersList.map(o => (
                                    <div key={o._id} className="border border-gray-100 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-mono text-sm font-bold text-gray-700">#{o._id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${o.status === 'Delivered' ? 'bg-green-100 text-green-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{o.status}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')} · ₹{o.totalAmount} · {o.items.length} items</div>
                                        <div className="text-xs text-gray-400 mt-1">{o.items.map(i => i.name).join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div >
    )
}

export default AdminDashboard;
