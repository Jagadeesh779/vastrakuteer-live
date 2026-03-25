const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

const getUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading users file:', err);
        return [];
    }
};

const saveUser = (user) => {
    const users = getUsers();
    // Simulate MongoDB _id
    user._id = user._id || Date.now().toString();
    user.createdAt = new Date();
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return user;
};

const findUserByEmail = (email) => {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const updateUser = (updatedUser) => {
    const users = getUsers();
    const index = users.findIndex(u => u._id === updatedUser._id);
    if (index !== -1) {
        users[index] = updatedUser;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return updatedUser;
    }
    return null;
};

const getAllUsers = () => {
    return getUsers();
};

const deleteUserById = (id) => {
    const users = getUsers();
    const filtered = users.filter(u => u._id !== id);
    fs.writeFileSync(USERS_FILE, JSON.stringify(filtered, null, 2));
    return filtered;
};

const updateUserById = (id, data) => {
    const users = getUsers();
    const index = users.findIndex(u => u._id === id);
    if (index !== -1) {
        users[index] = { ...users[index], ...data };
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return users[index];
    }
    return null;
};

module.exports = {
    getUsers,
    getAllUsers,
    saveUser,
    findUserByEmail,
    updateUser,
    deleteUserById,
    updateUserById
};
