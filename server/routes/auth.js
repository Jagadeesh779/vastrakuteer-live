const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const { saveUser, findUserByEmail, getAllUsers, deleteUserById, updateUserById } = require('../utils/jsonDb');
const { auth, admin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { buildWelcomeEmail, buildOtpEmail } = require('../utils/emailTemplates');
const { getActiveEvent } = require('../utils/eventCalendar');

// Global OTP Cache & Persistent File Backup
global.registerOTPs = global.registerOTPs || new Map();
global.loginOTPs = global.loginOTPs || new Map();

const OTP_FILE = path.join(__dirname, '../data/active_otps.json');

const getStoredOtps = () => {
    try {
        if (!fs.existsSync(OTP_FILE)) return {};
        return JSON.parse(fs.readFileSync(OTP_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
};

const storeOtp = (type, email, otp, durationMinutes = 10) => {
    const cleanEmail = email.toLowerCase().trim();
    const expires = Date.now() + durationMinutes * 60 * 1000;
    
    if (type === 'register') {
        global.registerOTPs.set(cleanEmail, { otp, expires });
    } else {
        global.loginOTPs.set(cleanEmail, { otp, expires });
    }

    try {
        const dataDir = path.dirname(OTP_FILE);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        const otps = getStoredOtps();
        otps[`${type}_${cleanEmail}`] = { otp, expires };
        fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
    } catch (e) {
        console.error('Error saving OTP to file:', e);
    }
};

const retrieveOtp = (type, email) => {
    const cleanEmail = email.toLowerCase().trim();
    
    let cached = type === 'register' ? global.registerOTPs.get(cleanEmail) : global.loginOTPs.get(cleanEmail);
    if (cached) return cached;

    const otps = getStoredOtps();
    const item = otps[`${type}_${cleanEmail}`];
    if (item) {
        if (type === 'register') {
            global.registerOTPs.set(cleanEmail, item);
        } else {
            global.loginOTPs.set(cleanEmail, item);
        }
        return item;
    }
    return null;
};

const removeOtp = (type, email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (type === 'register') {
        global.registerOTPs.delete(cleanEmail);
    } else {
        global.loginOTPs.delete(cleanEmail);
    }
    try {
        const otps = getStoredOtps();
        delete otps[`${type}_${cleanEmail}`];
        fs.writeFileSync(OTP_FILE, JSON.stringify(otps, null, 2));
    } catch (e) {}
};

const DEFAULT_EMAIL_USER = process.env.EMAIL_USER || 'vastrakuteer9@gmail.com';
const DEFAULT_EMAIL_PASS = process.env.EMAIL_PASS || 'lisxqpgpcqjuqkpp';

let cachedTransporter = null;
const getTransporter = () => {
    if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 10,
            auth: {
                user: DEFAULT_EMAIL_USER,
                pass: DEFAULT_EMAIL_PASS
            }
        });
    }
    return cachedTransporter;
};

// Helper to send welcome email
const sendWelcomeEmail = async (name, email) => {
    try {
        const activeEvent = getActiveEvent();
        const mailOptions = {
            from: `"Vastra Kuteer" <${DEFAULT_EMAIL_USER}>`,
            to: email,
            subject: `Welcome to Vastra Kuteer, ${name}! 🎉`,
            html: buildWelcomeEmail(name, activeEvent)
        };
        try {
            const transporter = getTransporter();
            await transporter.sendMail(mailOptions);
            console.log(`[WELCOME EMAIL] Sent successfully to ${email}`);
        } catch (primaryErr) {
            console.warn(`[WELCOME EMAIL] Primary SMTP failed for ${email}: ${primaryErr.message}. Trying fallback...`);
            const fallbackTransporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: DEFAULT_EMAIL_USER,
                    pass: DEFAULT_EMAIL_PASS
                }
            });
            await fallbackTransporter.sendMail(mailOptions);
            console.log(`[WELCOME EMAIL] Sent via fallback SMTP to ${email}`);
        }
    } catch (err) {
        console.error('Welcome email error:', err.message);
    }
};

// Helper for debugging logs
const logDebug = (msg) => {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${msg}`);
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'vastra_kuteer_secret_2026_secure_key_99';

// Helper to send token response
const sendTokenResponse = (user, statusCode, res, message = 'Success', isNewUser = false) => {
    const token = 'mock-jwt-token-' + Date.now();
    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: safeUser,
        isNewUser
    });
};

// @route   POST /api/auth/check-email
// @desc    Check if email exists for live validation
// @access  Public
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        const cleanEmail = email.trim().toLowerCase();
        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }
        return res.json({ exists: !!user });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/send-register-otp
// @desc    Generate and email an OTP for account creation
// @access  Public
router.post('/send-register-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const cleanEmail = email.trim().toLowerCase();

        // Check if user already exists in Mongo or JSON DB
        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in memory and persistent file (expires in 10 mins)
        storeOtp('register', cleanEmail, otp, 10);
        console.log(`[REGISTER OTP GENERATED] ${cleanEmail} -> ${otp}`);

        // Setup Nodemailer
        const transporter = getTransporter();

        const mailOptions = {
            from: `"Vastra Kuteer" <${DEFAULT_EMAIL_USER}>`,
            to: cleanEmail,
            subject: `Your Vastra Kuteer Registration OTP: ${otp}`,
            html: buildOtpEmail(otp, 'register', 'Valued Customer')
        };

        // Send email synchronously to ensure delivery before completing request
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[REGISTER OTP SENT] ${cleanEmail} -> ${otp} | MsgId: ${info.messageId}`);
        } catch (mailErr) {
            console.error(`[REGISTER OTP ERROR] ${cleanEmail}:`, mailErr.message);
            return res.status(500).json({ message: `Failed to send OTP email: ${mailErr.message}` });
        }

        return res.json({ message: 'OTP sent to your email' });

    } catch (err) {
        logDebug(`[OTP ERROR] ${err.message}`);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { fullName, email, password, otp, referredBy } = req.body;

    try {
        if (!otp) return res.status(400).json({ message: 'OTP is required' });

        const cleanEmail = (email || '').trim().toLowerCase();
        const inputOtp = otp.toString().trim();

        const cached = retrieveOtp('register', cleanEmail);
        if (!cached || Date.now() > cached.expires) {
            return res.status(400).json({ message: 'OTP has expired or not requested' });
        }
        if (cached.otp.toString().trim() !== inputOtp) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }

        // Clear OTP after successful verification
        removeOtp('register', cleanEmail);

        const newReferralCode = 'VK' + Math.random().toString(36).substring(2, 6).toUpperCase();

        // Fallback to JSON DB if Mongo is offline
        if (mongoose.connection.readyState !== 1) {
            logDebug(`[REGISTER] Using JSON DB. Email: ${cleanEmail}`);
            let user = findUserByEmail(cleanEmail);
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            user = { fullName, email: cleanEmail, password, role: 'user', referralCode: newReferralCode, referredBy, earnedCoupons: [] };

            if (referredBy) {
                const users = getAllUsers();
                const referrerIndex = users.findIndex(u => u.referralCode === referredBy);
                if (referrerIndex !== -1) {
                    users[referrerIndex].earnedCoupons = users[referrerIndex].earnedCoupons || [];
                    users[referrerIndex].earnedCoupons.push('REFERRAL15');
                    updateUserById(users[referrerIndex]._id || users[referrerIndex].id, users[referrerIndex]);
                }
            }

            const savedUser = saveUser(user);
            sendWelcomeEmail(fullName, cleanEmail).catch(err => console.error('Welcome email error:', err));
            sendTokenResponse(savedUser, 201, res, 'User registered successfully (Local Mode)', true);
            return;
        }

        // MongoDB Logic
        let user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ fullName, email: cleanEmail, password, referralCode: newReferralCode, referredBy, earnedCoupons: [] });
        await user.save();

        if (referredBy) {
            const referrer = await User.findOne({ referralCode: referredBy });
            if (referrer) {
                referrer.earnedCoupons.push('REFERRAL15');
                await referrer.save();
            }
        }

        sendWelcomeEmail(fullName, cleanEmail).catch(err => console.error('Welcome email error:', err));
        sendTokenResponse(user, 201, res, 'User registered successfully', true);

    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter both email and password' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Special static admin login
        if (cleanEmail === 'admin@vastrakuteer.com' && password === 'admin123') {
            const adminUser = { _id: 'mock-admin-id', fullName: 'Vastra Admin', email: cleanEmail, role: 'admin' };
            return sendTokenResponse(adminUser, 200, res, 'Admin Login successful');
        }

        let user = null;

        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }

        if (!user) {
            user = findUserByEmail(cleanEmail);
        }

        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid Email or Password' });
        }

        sendTokenResponse(user, 200, res, 'Login successful');

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/send-login-otp
// @desc    Generate and email an OTP for secure login (auto-registers if new user)
// @access  Public
router.post('/send-login-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const cleanEmail = email.trim().toLowerCase();

        // Check if user exists in Mongo or JSON DB
        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in memory and persistent file (expires in 5 mins)
        storeOtp('login', cleanEmail, otp, 5);
        console.log(`[LOGIN OTP GENERATED] ${cleanEmail} -> ${otp}`);

        // Setup Nodemailer
        const transporter = getTransporter();

        const mailOptions = {
            from: `"Vastra Kuteer" <${DEFAULT_EMAIL_USER}>`,
            to: cleanEmail,
            subject: `Your Vastra Kuteer Login OTP: ${otp}`,
            html: buildOtpEmail(otp, 'login', user ? (user.fullName || 'Valued Customer') : 'Valued Customer')
        };

        // Send email synchronously to ensure delivery before completing request
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log(`[LOGIN OTP SENT] ${cleanEmail} -> ${otp} | MsgId: ${info.messageId}`);
        } catch (mailErr) {
            console.error(`[LOGIN OTP ERROR] ${cleanEmail}:`, mailErr.message);
            return res.status(500).json({ message: `Failed to send OTP email: ${mailErr.message}` });
        }

        return res.json({ message: 'OTP sent to your email' });

    } catch (err) {
        logDebug(`[LOGIN OTP ERROR] ${err.message}`);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// @route   POST /api/auth/login-otp
// @desc    Verify OTP and log the user in (auto-registers new accounts)
// @access  Public
router.post('/login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const cleanEmail = email.trim().toLowerCase();
        const inputOtp = otp.toString().trim();

        const cached = retrieveOtp('login', cleanEmail);
        if (!cached || Date.now() > cached.expires) {
            return res.status(400).json({ message: 'OTP expired or not requested' });
        }
        if (cached.otp.toString().trim() !== inputOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Clear OTP after successful verification
        removeOtp('login', cleanEmail);

        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }

        let isNewUser = false;

        // Auto-create user if account does not exist yet!
        if (!user) {
            isNewUser = true;
            const newReferralCode = 'VK' + Math.random().toString(36).substring(2, 6).toUpperCase();
            const rawName = cleanEmail.split('@')[0];
            const fallbackName = rawName.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Valued Customer';

            if (mongoose.connection.readyState === 1) {
                user = new User({
                    fullName: fallbackName,
                    email: cleanEmail,
                    password: Math.random().toString(36).substring(2, 10),
                    referralCode: newReferralCode,
                    earnedCoupons: []
                });
                await user.save();
            } else {
                user = saveUser({
                    fullName: fallbackName,
                    email: cleanEmail,
                    password: Math.random().toString(36).substring(2, 10),
                    role: 'user',
                    referralCode: newReferralCode,
                    earnedCoupons: []
                });
            }
            sendWelcomeEmail(fallbackName, cleanEmail).catch(err => console.error('Welcome email error:', err));
        }

        sendTokenResponse(user, 200, res, 'Login successful via OTP', isNewUser);
    } catch (err) {
        console.error('OTP Login error:', err);
        res.status(500).json({ message: 'OTP Login failed' });
    }
});

const crypto = require('crypto');

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token
// @access  Public
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 3600000;

        let user = null;
        if (mongoose.connection.readyState === 1) {
            try {
                user = await User.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
            } catch (e) {}
        }
        if (!user) {
            user = findUserByEmail(cleanEmail);
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (mongoose.connection.readyState === 1 && user.save) {
            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpires = resetPasswordExpires;
            await user.save();
        }

        const clientUrl = req.headers.origin || 'https://vastrakuteer.in';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        // Respond immediately to UI
        res.status(200).json({ message: 'Password reset link sent! Please check your email.' });

        const sendEmail = require('../utils/sendEmail');
        const message = `You requested a password reset for Vastra Kuteer.\n\nPlease click this link to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

        sendEmail({
            email: user.email,
            subject: 'Vastra Kuteer - Password Reset',
            message
        }).catch(err => console.error('Forgot password email error:', err.message));

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            // JSON DB Mode doesn't fully support reset right now without big rewrites
            // This is just a mock for dev mode
            logDebug(`[RESET PW] JSON Mode reset requested`);
            return res.status(200).json({ message: 'Password reset successful (Mock JSON Mode)' });
        }

        // Hash token to compare with DB
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by valid unexpired token
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Update password & clear token fields
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ message: 'Server error processing request' });
    }
});

// Google Auth Route
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client("943636447257-pbnmejpnf6c5c02h1hfugmkq33lnq05b.apps.googleusercontent.com"); // Replace with actual Client ID

router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "943636447257-pbnmejpnf6c5c02h1hfugmkq33lnq05b.apps.googleusercontent.com", // Replace with actual Client ID
        });
        const { name, email, picture } = ticket.getPayload();

        // Check if user exists
        let user;
        let isNewUser = false;
        if (mongoose.connection.readyState !== 1) {
            // JSON DB Mode
            user = findUserByEmail(email);
            if (!user) {
                isNewUser = true;
                user = {
                    _id: Date.now().toString(),
                    fullName: name,
                    email,
                    role: 'user',
                    authProvider: 'google',
                    picture
                };
                const { saveUser } = require('../utils/jsonDb');
                saveUser(user);
            }
        } else {
            // MongoDB Mode
            user = await User.findOne({ email });
            if (!user) {
                isNewUser = true;
                user = new User({
                    fullName: name,
                    email,
                    password: Date.now().toString() + Math.random().toString(), // Dummy password
                    role: 'user',
                    authProvider: 'google'
                });
                await user.save();
            }
        }

        // Send welcome email immediately for brand new Google users
        if (isNewUser) await sendWelcomeEmail(name, email);

        sendTokenResponse(user, 200, res, 'Google Login successful', isNewUser);
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Google Sign-In failed' });
    }
});

// @route   POST /api/auth/google-userinfo
// @desc    Google login using userinfo (access-token flow)
// @access  Public
router.post('/google-userinfo', async (req, res) => {
    const { email, name, googleId } = req.body;
    try {
        if (!email) return res.status(400).json({ message: 'No email provided' });

        let user;
        let isNewUser = false;
        if (mongoose.connection.readyState !== 1) {
            user = findUserByEmail(email);
            if (!user) {
                isNewUser = true;
                user = { _id: Date.now().toString(), fullName: name || email, email, role: 'user', authProvider: 'google' };
                saveUser(user);
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
                isNewUser = true;
                user = new User({
                    fullName: name || email,
                    email,
                    password: googleId + Math.random().toString(),
                    role: 'user',
                    authProvider: 'google'
                });
                await user.save();
            }
        }
        // Send welcome email immediately for brand new Google users
        if (isNewUser) await sendWelcomeEmail(name || email, email);

        sendTokenResponse(user, 200, res, 'Google Login successful', isNewUser);
    } catch (err) {
        console.error('Google Userinfo Auth Error:', err);
        res.status(500).json({ message: 'Google Sign-In failed' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile safely
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        let user;
        if (mongoose.connection.readyState !== 1) {
            user = findUserByEmail(req.user.email || req.user.id);
            if (!user) {
                const users = getAllUsers();
                user = users.find(u => u._id === req.user.id || u.id === req.user.id);
            }
        } else {
            user = await User.findById(req.user.id).select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Auto-backfill referral data for legacy users
        let updated = false;
        if (!user.referralCode) {
            user.referralCode = 'VK' + Math.random().toString(36).substring(2, 6).toUpperCase();
            updated = true;
        }
        if (!user.earnedCoupons) {
            user.earnedCoupons = [];
            updated = true;
        }

        if (updated) {
            if (mongoose.connection.readyState !== 1) {
                const { updateUserById } = require('../utils/jsonDb');
                user = updateUserById(user._id || user.id, user);
            } else {
                await user.save();
            }
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/auth/users
// @desc    Get all registered users (admin only)
// @access  Admin
router.get('/users', admin, async (req, res) => {
    try {
        const usersMap = new Map();

        // 1. Fetch from MongoDB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const mongoUsers = await User.find().select('-password');
                mongoUsers.forEach(u => {
                    const obj = u.toObject ? u.toObject() : u;
                    if (obj.email) usersMap.set(obj.email.toLowerCase(), obj);
                });
            } catch (e) {
                console.error('Error fetching Mongo users:', e);
            }
        }

        // 2. Fetch from JSON DB fallback
        try {
            const jsonUsers = getAllUsers();
            jsonUsers.forEach(user => {
                const { password, ...rest } = user;
                if (rest.email && !usersMap.has(rest.email.toLowerCase())) {
                    usersMap.set(rest.email.toLowerCase(), rest);
                }
            });
        } catch (e) {
            console.error('Error fetching JSON users:', e);
        }

        const safeUsers = Array.from(usersMap.values());
        res.json(safeUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user by ID (admin only)
// @access  Admin
router.delete('/users/:id', admin, async (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'admin_static_id') {
            return res.status(400).json({ message: 'Cannot delete the main admin account' });
        }

        if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
            await User.findByIdAndDelete(id);
        }

        const remaining = deleteUserById(id);
        res.json({ message: 'User deleted', remaining: remaining ? remaining.length : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// @route   PUT /api/auth/users/:id/role
// @desc    Update a user's role (admin only)
// @access  Admin
router.put('/users/:id/role', admin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // MongoDB mode
        if (mongoose.connection.readyState === 1) {
            const updated = await User.findByIdAndUpdate(
                id,
                { role },
                { new: true }
            ).select('-password');
            if (!updated) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json(updated);
        }

        // JSON DB fallback
        const updated = updateUserById(id, { role });
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        const { password, ...safeUser } = updated;
        res.json(safeUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
