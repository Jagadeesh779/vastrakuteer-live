const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const { saveUser, findUserByEmail, getAllUsers, deleteUserById, updateUserById } = require('../utils/jsonDb');
const { auth, admin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { buildWelcomeEmail } = require('../utils/emailTemplates');
const { getActiveEvent } = require('../utils/eventCalendar');

// Global OTP Cache for pending registrations
global.registerOTPs = global.registerOTPs || new Map();
global.loginOTPs = global.loginOTPs || new Map();

const DEFAULT_EMAIL_USER = process.env.EMAIL_USER || 'vastrakuteer9@gmail.com';
const DEFAULT_EMAIL_PASS = process.env.EMAIL_PASS || 'lisxqpgpcqjuqkpp';

const getTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: DEFAULT_EMAIL_USER,
            pass: DEFAULT_EMAIL_PASS
        }
    });
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
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'vastrakuteer9@gmail.com',
                    pass: 'lisxqpgpcqjuqkpp'
                }
            });
            await fallbackTransporter.sendMail({
                ...mailOptions,
                from: `"Vastra Kuteer" <vastrakuteer9@gmail.com>`
            });
            console.log(`[WELCOME EMAIL] Sent via fallback SMTP successfully to ${email}`);
        }
    } catch (err) {
        console.error(`[WELCOME EMAIL] All SMTP attempts failed for ${email}:`, err.message);
    }
};

const LOG_FILE = path.join(__dirname, '../debug.log');

const logDebug = (msg) => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, logMsg);
    console.log(msg); // Also log to console
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'vastra_kuteer_secret_2026_secure_key_99';

// Helper to send token response
const sendTokenResponse = (user, statusCode, res, msg, isNewUser = false) => {
    const payload = {
        user: {
            id: user._id || user.id,
            role: user.role
        }
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(statusCode).json({
        message: msg,
        token,
        isNewUser, // <--- Added this flag
        user: {
            _id: user._id || user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    });
};

// @route   POST /api/auth/check-email
// @desc    Check if email exists for live validation
// @access  Public
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

        // Cache it for 10 minutes
        global.registerOTPs.set(cleanEmail, { otp, expires: Date.now() + 10 * 60 * 1000 });

        // Setup Nodemailer
        const transporter = getTransporter();

        const mailOptions = {
            from: `"Vastra Kuteer" <${DEFAULT_EMAIL_USER}>`,
            to: cleanEmail,
            subject: 'Vastra Kuteer Registration OTP',
            html: `<h2>Welcome to Vastra Kuteer!</h2>
                   <p>Your OTP for account registration is <strong>${otp}</strong>.</p>
                   <p>This code will expire in 10 minutes.</p>`
        };

        // Send HTTP response immediately so UI transitions instantly
        res.json({ message: 'OTP sent to your email' });

        // Send email in background
        transporter.sendMail(mailOptions).then(() => {
            logDebug(`[REGISTER OTP SENT] ${cleanEmail} - OTP: ${otp}`);
        }).catch(err => {
            console.error(`[REGISTER OTP ERROR] ${cleanEmail}:`, err.message);
        });

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

        const cached = global.registerOTPs.get(cleanEmail);
        if (!cached || cached.expires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired or is invalid' });
        }
        if (cached.otp !== otp.trim()) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }

        // Clear OTP after successful use
        global.registerOTPs.delete(cleanEmail);

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
            // Send welcome email asynchronously without blocking registration response
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

        // Send welcome email asynchronously without blocking registration response
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
// @desc    Generate and email an OTP for secure login
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

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Cache it for 5 minutes
        global.loginOTPs.set(cleanEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

        // Setup Nodemailer
        const transporter = getTransporter();

        const mailOptions = {
            from: `"Vastra Kuteer" <${DEFAULT_EMAIL_USER}>`,
            to: cleanEmail,
            subject: 'Vastra Kuteer Login OTP',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #be185d; text-align: center;">Secure Login</h2>
                    <p>Hello ${user.fullName || 'Valued Customer'},</p>
                    <p>Your One-Time Password (OTP) for logging into Vastra Kuteer is:</p>
                    <div style="background: #fdf2f8; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #be185d; border-radius: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Vastra Kuteer. All rights reserved.</p>
                   </div>`
        };

        // Respond immediately to UI
        res.json({ message: 'OTP sent to your email' });

        // Send email in background
        transporter.sendMail(mailOptions).then(() => {
            logDebug(`[LOGIN OTP SENT] ${cleanEmail} - OTP: ${otp}`);
        }).catch(err => {
            console.error(`[LOGIN OTP ERROR] ${cleanEmail}:`, err.message);
        });

    } catch (err) {
        logDebug(`[LOGIN OTP ERROR] ${err.message}`);
        res.status(500).json({ message: 'Failed to send login OTP' });
    }
});

// @route   POST /api/auth/login-otp
// @desc    Verify OTP and log the user in
// @access  Public
router.post('/login-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const cleanEmail = email.trim().toLowerCase();

        const cached = global.loginOTPs.get(cleanEmail);
        if (!cached) return res.status(400).json({ message: 'OTP expired or not requested' });

        if (Date.now() > cached.expires) {
            global.loginOTPs.delete(cleanEmail);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (cached.otp !== otp.trim()) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP Valid - Proceed to Login
        global.loginOTPs.delete(cleanEmail);

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

        sendTokenResponse(user, 200, res, 'Login successful via OTP');
    } catch (err) {
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
