const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vastra_kuteer');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        // Continue to update JSON even if Mongo fails
    }
};

const resetAdmin = async () => {
    await connectDB();

    const email = 'admin@vastrakuteer.com';
    const password = 'admin123';

    // 1. Update MongoDB
    if (mongoose.connection.readyState === 1) {
        try {
            let user = await User.findOne({ email });
            if (user) {
                user.password = password;
                user.role = 'admin';
                await user.save();
                console.log('Admin user updated in MongoDB.');
            } else {
                user = new User({
                    fullName: 'Vastra Admin',
                    email,
                    password,
                    role: 'admin'
                });
                await user.save();
                console.log('Admin user created in MongoDB.');
            }
        } catch (err) {
            console.error('Error updating MongoDB:', err);
        }
    }

    // 2. Update JSON File
    try {
        const jsonPath = path.join(__dirname, 'data', 'users.json');
        let users = [];
        if (fs.existsSync(jsonPath)) {
            users = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        }

        const existingIndex = users.findIndex(u => u.email === email);
        const adminData = {
            fullName: 'Vastra Admin',
            email,
            password,
            role: 'admin',
            _id: 'admin_static_id',
            createdAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            users[existingIndex] = { ...users[existingIndex], ...adminData };
        } else {
            users.push(adminData);
        }

        fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
        console.log('Admin user updated in users.json.');

    } catch (err) {
        console.error('Error updating JSON file:', err);
    }

    if (mongoose.connection.readyState === 1) {
        mongoose.connection.close();
    }
};

resetAdmin();
