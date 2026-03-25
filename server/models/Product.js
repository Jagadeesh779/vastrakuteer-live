const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: false // Optional
    },
    image: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: []
    },
    price: {
        type: Number,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    originalPrice: {
        type: Number,
        required: false,
    },
    material: {
        type: String,
        required: false,
    },
    pattern: {
        type: String,
        required: false,
    },
    occasion: {
        type: String,
        required: false,
    },
    countryOfOrigin: {
        type: String,
        required: false,
        default: 'India',
    },
    weavingRegion: {
        type: String,
        required: false,
        default: 'Various Regions, India',
    },
    fabricCare: {
        type: String,
        required: false,
    },
    isHandloom: {
        type: Boolean,
        default: true
    },
    showOnHome: {
        type: Boolean,
        default: false
    },
    showOnShop: {
        type: Boolean,
        default: true
    },
    showOnCollections: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: {
        type: Number,
        default: 0,
    },
    count: {
        type: Number,
        default: 0,
    },
    sizes: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 0 },
        XL: { type: Number, default: 0 },
        XXL: { type: Number, default: 0 },
        XXXL: { type: Number, default: 0 }
    },
    reviewsList: [{
        user: String,
        rating: Number,
        comment: String,
        image: String,
        date: { type: Date, default: Date.now }
    }],
    isSoldOut: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
