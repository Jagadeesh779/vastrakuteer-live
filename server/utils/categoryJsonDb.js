const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Initial Dummy Data
const dummyCategories = [
    { _id: "cat_1", name: "Sarees", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=2574&auto=format&fit=crop", description: "Elegant traditional sarees", showOnHome: true, showOnShop: true, showOnCollections: true },
    { _id: "cat_2", name: "Kurtas", image: "https://images.unsplash.com/photo-1583391733958-e026f39a4823?q=80&w=2574&auto=format&fit=crop", description: "Comfortable and stylish kurtas", showOnHome: true, showOnShop: true, showOnCollections: true },
    { _id: "cat_3", name: "Lehengas", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2583&auto=format&fit=crop", description: "Wedding and festive lehengas", showOnHome: false, showOnShop: true, showOnCollections: true }
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure categories file exists
if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(dummyCategories, null, 2));
}

const getCategories = () => {
    try {
        const data = fs.readFileSync(CATEGORIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading categories file:', err);
        return [];
    }
};

const saveCategory = (category) => {
    const categories = getCategories();
    category._id = category._id || Date.now().toString();
    categories.unshift(category);
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
    return category;
};

const updateCategory = (id, updates) => {
    const categories = getCategories();
    const index = categories.findIndex(c => c._id === id);
    if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        return categories[index];
    }
    return null;
};

const deleteCategory = (id) => {
    let categories = getCategories();
    const initialLength = categories.length;
    categories = categories.filter(c => c._id !== id);
    if (categories.length !== initialLength) {
        fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
        return true;
    }
    return false;
};

module.exports = {
    getCategories,
    saveCategory,
    updateCategory,
    deleteCategory
};
