const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { getProducts, updateProduct, getProductById } = require('../utils/productJsonDb');
const { saveOrder, getOrders, getOrderById, updateOrder } = require('../utils/orderJsonDb');
const Product = require('../models/Product'); // Need this for Mongo updates
const { auth, admin } = require('../middleware/auth');
const crypto = require('crypto');

// Helper to Check DB Connection
const isConnected = () => mongoose.connection.readyState === 1;

// Create a new order (Public - Guest Checkout allowed)
router.post('/', async (req, res) => {
    try {
        const {
            user, items, totalAmount, shippingAddress, paymentResult,
            isPaid, paidAt, razorpay_payment_id,
            razorpay_order_id, razorpay_signature
        } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ msg: 'No order items' });
        }

        // ─── Server-Side Payment Verification (Security Fix) ──────────────────
        // Only verify if NOT in an offline sale or test mode
        if (razorpay_payment_id && razorpay_signature && razorpay_order_id) {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ msg: 'Invalid payment signature. Transaction rejected.' });
            }
        } else if (paymentResult?.id !== 'OFFLINE_SALE' && process.env.NODE_ENV === 'production') {
            // Strict check in production for online payments
            return res.status(400).json({ msg: 'Payment details required' });
        }

        // ─── Stock Management with Rollback ──────────────────────────────────
        const sumSizes = (sizes) =>
            Object.values(sizes || {}).reduce((acc, v) => acc + Math.max(0, Number(v) || 0), 0);

        const processedProducts = []; // To track for rollback

        try {
            for (const item of items) {
                const productId = item.product;
                const qty = Math.max(1, Number(item.qty) || 1);
                const size = item.selectedSize;

                if (isConnected()) {
                    const product = await Product.findById(productId);
                    if (product) {
                        const originalSizes = JSON.parse(JSON.stringify(product.sizes || {}));
                        processedProducts.push({ id: productId, originalSizes, type: 'mongo' });

                        if (size && product.sizes && product.sizes[size] !== undefined) {
                            const available = Math.max(0, Number(product.sizes[size]) || 0);
                            const deduct = Math.min(qty, available);
                            product.sizes[size] = available - deduct;
                            product.markModified('sizes');
                        }
                        product.count = sumSizes(product.sizes);
                        product.isSoldOut = product.count <= 0;
                        await product.save();
                    }
                } else {
                    const allProducts = getProducts();
                    const product = allProducts.find(p => p._id === productId);
                    if (product) {
                        const originalSizes = JSON.parse(JSON.stringify(product.sizes || {}));
                        processedProducts.push({ id: productId, originalSizes, type: 'json' });

                        const sizes = { ...(product.sizes || {}) };
                        if (size && sizes[size] !== undefined) {
                            const available = Math.max(0, Number(sizes[size]) || 0);
                            sizes[size] = available - Math.min(qty, available);
                        }
                        const newCount = sumSizes(sizes);
                        updateProduct(productId, {
                            sizes,
                            count: newCount,
                            isSoldOut: newCount <= 0
                        });
                    }
                }
            }

            const order = new Order({
                user,
                items,
                totalAmount,
                shippingAddress,
                paymentResult,
                isPaid,
                paidAt,
                razorpay_payment_id: razorpay_payment_id || null
            });

            if (isConnected()) {
                const createdOrder = await order.save();
                res.status(201).json(createdOrder);
            } else {
                const savedOrder = saveOrder({
                    user,
                    items,
                    totalAmount,
                    shippingAddress,
                    paymentResult,
                    createdAt: new Date(),
                    isPaid,
                    paidAt,
                    razorpay_payment_id: razorpay_payment_id || null
                });
                res.status(201).json(savedOrder);
            }

        } catch (saveError) {
            console.error("Order save failed, initiating stock rollback...");
            // Rollback stock
            for (const p of processedProducts) {
                if (p.type === 'mongo') {
                    const product = await Product.findById(p.id);
                    if (product) {
                        product.sizes = p.originalSizes;
                        product.count = sumSizes(product.sizes);
                        product.isSoldOut = product.count <= 0;
                        product.markModified('sizes');
                        await product.save();
                    }
                } else {
                    const newCount = sumSizes(p.originalSizes);
                    updateProduct(p.id, {
                        sizes: p.originalSizes,
                        count: newCount,
                        isSoldOut: newCount <= 0
                    });
                }
            }
            throw saveError;
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get all orders (Admin only - Protected)
router.get('/', admin, async (req, res) => {
    try {
        // In a real app, check for admin role here or in middleware
        if (!isConnected()) {
            const orders = getOrders();
            const { getUsers } = require('../utils/jsonDb');
            const users = getUsers();

            // Manual populate
            const populatedOrders = orders.map(order => {
                if (order.user) {
                    const user = users.find(u => u._id === order.user);
                    if (user) {
                        return { ...order, user: { _id: user._id, fullName: user.fullName, email: user.email } };
                    }
                }
                return order;
            });
            return res.json(populatedOrders);
        }
        const orders = await Order.find({}).populate('user', 'id fullName email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get logged in user orders (Public/Protected by Client Logic for now, or use auth if forced)
// Keeping public for now as guests might want to track by ID, or we can make it protected later.
// For now, let's leave it open but frontend filters.
router.get('/myorders/:userId', auth, async (req, res) => {
    try {
        // Security: Ensure user can only see their own orders unless they are admin
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Not authorized to view these orders' });
        }

        if (!isConnected()) {
            // Filter manually
            const allOrders = getOrders();
            const userOrders = allOrders.filter(o => {
                if (typeof o.user === 'object' && o.user !== null) return o.user._id === req.params.userId;
                return o.user === req.params.userId;
            });
            return res.json(userOrders);
        }
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get total order count (Admin polling for new order notifications)
router.get('/count', auth, async (req, res) => {
    try {
        if (!isConnected()) {
            const orders = getOrders();
            return res.json({ count: orders.length });
        }
        const count = await Order.countDocuments({});
        res.json({ count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Get order by ID or Tracking Number (Public for tracking)
router.get('/:id', async (req, res) => {
    try {
        const identifier = req.params.id;

        if (!isConnected()) {
            const allOrders = getOrders();
            // Try ID first
            let order = allOrders.find(o => o._id === identifier);
            
            // Try tracking number
            if (!order) {
                order = allOrders.find(o => o.deliveryInfo?.trackingNumber === identifier);
            }

            // Try truncated ID (last 6)
            if (!order && identifier.length === 6) {
                order = allOrders.find(o => o._id.slice(-6).toUpperCase() === identifier.toUpperCase());
            }

            if (order) return res.json(order);
            return res.status(404).json({ msg: 'Order not found' });
        }

        // MongoDB Mode
        let order;

        // 1. Try by ObjectId if valid
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            order = await Order.findById(identifier).populate('user', 'fullName email');
        }

        // 2. Try by tracking number
        if (!order) {
            order = await Order.findOne({ 'deliveryInfo.trackingNumber': identifier }).populate('user', 'fullName email');
        }

        // 3. Try by truncated ID (last 6)
        if (!order && identifier.length === 6) {
            // We use a regex to match the end of the _id string
            // Note: In Mongo, searching by partial _id string requires conversion or choosing a different field.
            // Since _id is an ObjectId, we might need to use $where or an aggregation, but for performance, 
            // we'll try a regex on the string representation if possible, or just fetch recent orders and filter.
            // Better yet, let's use a regex match on the stringified _id.
            const allRecent = await Order.find({}).sort({ createdAt: -1 }).limit(100).populate('user', 'fullName email');
            order = allRecent.find(o => o._id.toString().slice(-6).toUpperCase() === identifier.toUpperCase());
        }

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ msg: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Cancel an order (user-facing — only Placed or Processing orders can be cancelled)
router.put('/:id/cancel', async (req, res) => {
    try {
        // Helper: attempt Razorpay refund if payment ID exists
        const attemptRefund = async (paymentId, amount) => {
            if (!paymentId || !process.env.RAZORPAY_KEY_ID) return null;
            try {
                const Razorpay = require('razorpay');
                const rzp = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET
                });
                const refund = await rzp.payments.refund(paymentId, {
                    amount: Math.round(amount * 100) // paise
                });
                return { refundId: refund.id, status: refund.status };
            } catch (refundErr) {
                console.error('Razorpay refund failed:', refundErr.error?.description || refundErr.message);
                return null;
            }
        };

        if (!isConnected()) {
            const order = getOrderById(req.params.id);
            if (!order) return res.status(404).json({ msg: 'Order not found' });
            if (!['Placed', 'Processing'].includes(order.status)) {
                return res.status(400).json({ msg: `Cannot cancel an order that is already ${order.status}` });
            }

            // ─── Stock Restore (Order Cancelled — JSON DB) ───────────────────
            const sumSizesJson = (sizes) =>
                Object.values(sizes || {}).reduce((acc, v) => acc + Math.max(0, Number(v) || 0), 0);

            if (order.items) {
                for (const item of order.items) {
                    const productId = typeof item.product === 'object' ? item.product?._id : item.product;
                    const qty  = Math.max(1, Number(item.qty) || 1);
                    const size = item.selectedSize;
                    const allProducts = getProducts();
                    const product = allProducts.find(p => p._id === productId);
                    if (product) {
                        const sizes = { ...(product.sizes || {}) };
                        if (size && sizes[size] !== undefined) {
                            // Add back qty; use Number() to guard against string values
                            sizes[size] = Math.max(0, Number(sizes[size]) || 0) + qty;
                        }
                        const newCount = sumSizesJson(sizes);
                        updateProduct(productId, {
                            sizes,
                            count:     newCount,
                            isSoldOut: newCount <= 0   // false as long as any stock remains
                        });
                    }
                }
            }
            // ─────────────────────────────────────────────────────────────────

            const refundResult = await attemptRefund(order.razorpay_payment_id, order.totalAmount);
            const saved = updateOrder(req.params.id, {
                status: 'Cancelled',
                refundStatus: refundResult ? 'Refunded' : (order.razorpay_payment_id ? 'Refund Failed' : 'N/A'),
                refundId: refundResult?.refundId || null
            });
            return res.json({ ...saved, refundInitiated: !!refundResult });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        if (!['Placed', 'Processing'].includes(order.status)) {
            return res.status(400).json({ msg: `Cannot cancel an order that is already ${order.status}` });
        }

        // ─── Stock Restore (Order Cancelled — MongoDB) ───────────────────────
        const sumSizesMongo = (sizes) =>
            Object.values(sizes || {}).reduce((acc, v) => acc + Math.max(0, Number(v) || 0), 0);

        for (const item of order.items) {
            const productId = typeof item.product === 'object' ? item.product?._id || item.product : item.product;
            const qty  = Math.max(1, Number(item.qty) || 1);
            const size = item.selectedSize;
            try {
                const product = await Product.findById(productId);
                if (product) {
                    if (size && product.sizes && product.sizes[size] !== undefined) {
                        const current = Math.max(0, Number(product.sizes[size]) || 0);
                        product.sizes[size] = current + qty;
                        product.markModified('sizes');
                    }
                    // count is always derived from sizes (single source of truth)
                    product.count    = sumSizesMongo(product.sizes);
                    product.isSoldOut = product.count <= 0;
                    await product.save();
                }
            } catch (stockErr) {
                console.error('Stock restore error for product', productId, stockErr.message);
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        const refundResult = await attemptRefund(order.razorpay_payment_id, order.totalAmount);

        order.status = 'Cancelled';
        order.refundStatus = refundResult ? 'Refunded' : (order.razorpay_payment_id ? 'Refund Failed' : 'N/A');
        order.refundId = refundResult?.refundId || null;

        const updatedOrder = await order.save();
        res.json({ ...updatedOrder.toObject(), refundInitiated: !!refundResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});


// Update order status (Admin only - Protected)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!isConnected()) {
            const saved = updateOrder(req.params.id, { status });
            if (saved) return res.json(saved);
            return res.status(404).json({ msg: 'Order not found' });
        }

        const order = await Order.findById(req.params.id).populate('user', 'fullName email');
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        order.status = status;
        const updatedOrder = await order.save();

        // Send email to customer if they have an email
        const customerEmail = order.user?.email || order.shippingAddress?.email;
        if (customerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                const nodemailer = require('nodemailer');
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });
                const statusEmoji = { Placed: '📦', Packed: '🎁', Shipped: '🚚', Delivered: '✅', Cancelled: '❌' }[status] || '📋';
                await transporter.sendMail({
                    from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
                    to: customerEmail,
                    subject: `${statusEmoji} Your Order #${order._id.toString().slice(-6).toUpperCase()} is ${status}`,
                    html: `
                        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:30px;background:#F8F8FF;border-radius:12px;">
                            <h1 style="color:#065f46;text-align:center;">Vastra Kuteer</h1>
                            <h2 style="color:#1a1a1a;">Order Update ${statusEmoji}</h2>
                            <p>Hi ${order.user?.fullName || 'Valued Customer'},</p>
                            <p>Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> is now <strong style="color:#0d9488;">${status}</strong>.</p>
                            <div style="background:#E6FFFA;border-left:4px solid #0d9488;padding:15px;border-radius:8px;margin:20px 0;">
                                <p style="margin:0;font-size:18px;font-weight:bold;color:#065f46;">${statusEmoji} Status: ${status}</p>
                            </div>
                            <p><strong>Order Total:</strong> ₹${order.totalAmount}</p>
                            <p><strong>Items:</strong> ${order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}</p>
                            ${status === 'Shipped' && order.deliveryInfo?.trackingNumber ? `<p><strong>Tracking:</strong> ${order.deliveryInfo.courierName || ''} - ${order.deliveryInfo.trackingNumber}</p>` : ''}
                            <p style="color:#666;font-size:12px;margin-top:30px;">Thank you for shopping with Vastra Kuteer!</p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Order status email failed:', emailErr.message);
            }
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// Save delivery info (Admin only - Protected)
router.put('/:id/delivery', auth, async (req, res) => {
    try {
        const { courierName, trackingNumber, currentLocation } = req.body;
        const deliveryInfo = { courierName, trackingNumber, currentLocation, updatedAt: new Date() };

        if (!isConnected()) {
            const saved = updateOrder(req.params.id, { deliveryInfo });
            if (saved) return res.json(saved);
            return res.status(404).json({ msg: 'Order not found' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });

        order.deliveryInfo = deliveryInfo;
        const updated = await order.save();
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error' });
    }
});



// Get Daily Sales Analytics (Admin only)
router.get('/analytics/daily', auth, async (req, res) => {
    try {
        if (!isConnected()) {
            // JSON DB Fallback for Analytics
            const allOrders = getOrders();
            const allProducts = getProducts();
            const productMap = {};
            allProducts.forEach(p => { productMap[p._id] = p; });

            const dailyStats = allOrders.reduce((acc, order) => {
                const date = new Date(order.createdAt).toLocaleDateString();
                if (!acc[date]) {
                    acc[date] = { date, totalSales: 0, orderCount: 0, products: [] };
                }
                acc[date].totalSales += order.totalAmount;
                acc[date].orderCount += 1;
                if (order.items) {
                    order.items.forEach(item => {
                        // Look up productCode from products if not on item
                        const productId = typeof item.product === 'object' ? item.product?._id : item.product;
                        const productCode = item.productCode || (productId && productMap[productId]?.productCode) || null;
                        acc[date].products.push({
                            name: item.name,
                            image: item.image,
                            qty: item.qty,
                            price: item.price,
                            selectedSize: item.selectedSize,
                            productCode
                        });
                    });
                }
                return acc;
            }, {});

            return res.json(Object.values(dailyStats).sort((a, b) => new Date(b.date) - new Date(a.date)));
        }

        // MongoDB — populate product to always get productCode even for old orders
        const allOrders = await Order.find({})
            .populate('items.product', 'productCode')
            .sort({ createdAt: -1 });

        const dailyMap = {};
        allOrders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
            if (!dailyMap[date]) {
                dailyMap[date] = { date, totalSales: 0, orderCount: 0, products: [] };
            }
            dailyMap[date].totalSales += order.totalAmount;
            dailyMap[date].orderCount += 1;
            if (order.items) {
                order.items.forEach(item => {
                    // item.product is now populated — use its productCode if item doesn't have one
                    const productCode = item.productCode || item.product?.productCode || null;
                    dailyMap[date].products.push({
                        name: item.name,
                        image: item.image,
                        qty: item.qty,
                        price: item.price,
                        selectedSize: item.selectedSize,
                        productCode
                    });
                });
            }
        });

        const result = Object.values(dailyMap).sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(result);

    } catch (err) {
        console.error("Analytics Error:", err);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;
