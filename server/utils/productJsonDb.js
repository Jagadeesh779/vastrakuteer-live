const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Dummy data for seeding
const dummyTrending = [
    { _id: "101", brand: "Vastra Kuteer", name: "Royal Banarasi Silk", price: 5999, originalPrice: 9999, rating: 4.8, reviews: 42, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "102", brand: "Saree World", name: "Embroidered Party Wear", price: 3599, originalPrice: 5999, rating: 4.5, reviews: 28, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "103", brand: "Desi Thread", name: "Handloom Cotton", price: 1899, originalPrice: 2499, rating: 4.2, reviews: 15, image: "https://images.unsplash.com/photo-1583391733958-e026f39a4823?q=80&w=2574&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "104", brand: "Vastra Kuteer", name: "Festival Special", price: 4499, originalPrice: 6000, rating: 4.9, reviews: 89, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=2670&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "105", brand: "Heritage", name: "Pochampally Ikat", price: 5899, originalPrice: 8499, rating: 4.7, reviews: 110, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "106", brand: "Weaver's Nest", name: "Gadwal Silk", price: 6299, originalPrice: 8999, rating: 4.8, reviews: 90, image: "https://images.unsplash.com/photo-1583391733975-40b615d18d8e?q=80&w=1974&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "107", brand: "Vastra Kuteer", name: "Paithani Silk", price: 8999, originalPrice: 14999, rating: 5.0, reviews: 32, image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop", images: [], isSoldOut: false },
    { _id: "108", brand: "Ethnic Charm", name: "Tussar Silk", price: 3899, originalPrice: 5699, rating: 4.6, reviews: 40, image: "https://images.unsplash.com/photo-1621640786029-22ad3168d660?q=80&w=2070&auto=format&fit=crop", images: [], isSoldOut: false }
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure products file exists with dummy data
if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(dummyTrending, null, 2));
}

const getProducts = () => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading products file:', err);
        return [];
    }
};

const saveProduct = (product) => {
    const products = getProducts();
    product._id = product._id || Date.now().toString();
    products.unshift(product);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    return product;
};

const saveMany = (newProducts) => {
    const products = getProducts();
    const productsToAdd = newProducts.map(p => ({
        ...p,
        _id: p._id || Date.now().toString() + Math.random().toString(36).substr(2, 5)
    }));
    const updatedProducts = [...productsToAdd, ...products];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    return productsToAdd;
};

const updateProduct = (id, updates) => {
    const products = getProducts();
    const index = products.findIndex(p => p._id === id);
    if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        return products[index];
    }
    return null;
};

const deleteProduct = (id) => {
    let products = getProducts();
    const initialLength = products.length;
    products = products.filter(p => p._id !== id);
    if (products.length !== initialLength) {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        return true;
    }
    return false;
};

const resetProducts = () => {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(dummyTrending, null, 2));
    return dummyTrending;
};

const clearProducts = () => {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
    return [];
};

module.exports = {
    getProducts,
    saveProduct,
    updateProduct,
    deleteProduct,
    resetProducts,
    resetProducts,
    clearProducts,
    saveMany
};
