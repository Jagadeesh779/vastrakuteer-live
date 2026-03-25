const mongoose = require('mongoose');
const User = require('./models/User');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const USERS_FILE = path.join(__dirname, 'data', 'users.json');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000 // Timeout after 5s
        });
        console.log('MongoDB Connected');
        return true;
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        return false;
    }
};

const checkJSONDB = (email) => {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            const users = JSON.parse(data);
            const user = users.find(u => u.email === email);
            if (user) {
                console.log('\n[JSON DB] User found:');
                console.log('Email:', user.email);
                console.log('Password:', user.password);
                console.log('Role:', user.role);
            } else {
                console.log(`\n[JSON DB] User with email ${email} not found.`);
            }
        } else {
            console.log('\n[JSON DB] File not found.');
        }
    } catch (err) {
        console.error('\n[JSON DB] Error:', err.message);
    }
};

const checkUser = async () => {
    const email = 'Anusha.vastraKuteer@gmail.com';

    // Check JSON DB first
    checkJSONDB(email);

    // Check Mongo
    const isConnected = await connectDB();
    if (isConnected) {
        try {
            const user = await User.findOne({ email });
            if (user) {
                console.log('\n[MongoDB] User found:');
                console.log('ID:', user._id);
                console.log('Email:', user.email);
                console.log('Password:', user.password); // Plain text check
                console.log('Role:', user.role);
            } else {
                console.log(`\n[MongoDB] User with email ${email} not found.`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.disconnect();
        }
    } else {
        console.log('\nSkipping MongoDB check due to connection failure.');
    }
};

checkUser();
