const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            productCode: { type: String },
            selectedSize: { type: String }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    deliveryInfo: {
        courierName: { type: String, default: '' },
        trackingNumber: { type: String, default: '' },
        currentLocation: { type: String, default: '' },
        updatedAt: { type: Date }
    },
    razorpay_payment_id: { type: String, default: null },
    refundStatus: {
        type: String,
        enum: ['N/A', 'Refunded', 'Refund Failed'],
        default: 'N/A'
    },
    refundId: { type: String, default: null }
});

module.exports = mongoose.model('Order', OrderSchema);
