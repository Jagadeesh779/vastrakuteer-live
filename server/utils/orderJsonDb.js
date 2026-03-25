const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure orders file exists
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

const getOrders = () => {
    try {
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading orders file:', err);
        return [];
    }
};

const saveOrder = (order) => {
    const orders = getOrders();
    order._id = order._id || Date.now().toString();
    order.createdAt = order.createdAt || new Date().toISOString();
    order.status = order.status || 'Placed';
    orders.unshift(order);
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return order;
};

const updateOrder = (id, updates) => {
    const orders = getOrders();
    const index = orders.findIndex(o => o._id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return orders[index];
    }
    return null;
};

const getOrderById = (id) => {
    const orders = getOrders();
    return orders.find(o => o._id === id);
};

const getUserOrders = (userId) => {
    const orders = getOrders();
    // Handle guest orders check or specific user ID match
    // Note: userId might be 'guest' or an actual ID string
    return orders.filter(o => {
        if (typeof o.user === 'object') return o.user?._id === userId;
        return o.user === userId;
    });
};

module.exports = {
    getOrders,
    saveOrder,
    updateOrder,
    getOrderById,
    getUserOrders
};
