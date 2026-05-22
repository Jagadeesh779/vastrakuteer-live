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

// Helper to send welcome email asynchronously (non-blocking)
const sendWelcomeEmail = async (name, email) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
        const activeEvent = getActiveEvent();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Welcome to Vastra Kuteer, ${name}! 🎉`,
            html: buildWelcomeEmail(name, activeEvent)
        });
        console.log(`[WELCOME EMAIL] Sent to ${email}`);
    } catch (err) {
        console.error(`[WELCOME EMAIL] Failed for ${email}:`, err.message);
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
const JWT_SECRET = process.env.JWT_SECRET;

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
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email required' });

        if (mongoose.connection.readyState !== 1) {
            let user = findUserByEmail(email);
            return res.json({ exists: !!user });
        } else {
            let user = await User.findOne({ email });
            return res.json({ exists: !!user });
        }
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

        // Check if user already exists
        let userExists = false;
        if (mongoose.connection.readyState !== 1) {
            userExists = !!findUserByEmail(email);
        } else {
            userExists = !!(await User.findOne({ email }));
        }

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Cache it for 10 minutes
        global.registerOTPs.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

        // Setup Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Vastra Kuteer Registration OTP',
            html: `<h2>Welcome to Vastra Kuteer!</h2>
                   <p>Your OTP for account registration is <strong>${otp}</strong>.</p>
                   <p>This code will expire in 10 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);
        logDebug(`[OTP SENT] ${email} - OTP: ${otp}`);

        res.json({ message: 'OTP sent to your email' });
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

        const cached = global.registerOTPs.get(email);
        if (!cached || cached.expires < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired or is invalid' });
        }
        if (cached.otp !== otp) {
            return res.status(400).json({ message: 'Incorrect OTP' });
        }

        // Clear OTP after successful use
        global.registerOTPs.delete(email);

        const newReferralCode = 'VK' + Math.random().toString(36).substring(2, 6).toUpperCase();

        // Fallback to JSON DB if Mongo is offline
        if (mongoose.connection.readyState !== 1) {
            logDebug(`[REGISTER] Using JSON DB. Email: ${email}`);
            let user = findUserByEmail(email);
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            user = { fullName, email, password, role: 'user', referralCode: newReferralCode, referredBy, earnedCoupons: [] };

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
            // Send welcome email (non-blocking)
            sendWelcomeEmail(fullName, email);
            sendTokenResponse(savedUser, 201, res, 'User registered successfully (Local Mode)', true);
            return;
        }

        // MongoDB Logic
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ fullName, email, password, referralCode: newReferralCode, referredBy, earnedCoupons: [] });
        await user.save();

        if (referredBy) {
            const referrer = await User.findOne({ referralCode: referredBy });
            if (referrer) {
                referrer.earnedCoupons.push('REFERRAL15');
                await referrer.save();
            }
        }

        sendTokenResponse(user, 201, res, 'User registered successfully', true);
        // Send welcome email (non-blocking)
        sendWelcomeEmail(fullName, email);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (mongoose.connection.readyState !== 1) {
            logDebug(`[LOGIN] Using JSON DB. Email: ${email}`);
            if (email === 'admin@vastrakuteer.com' && password === 'admin123') {
                const adminUser = { _id: 'mock-admin-id', fullName: 'Vastra Admin', email, role: 'admin' };
                sendTokenResponse(adminUser, 200, res, 'Admin Login successful (Mock)');
                return;
            }
            const user = findUserByEmail(email);
            if (!user || user.password !== password) {
                return res.status(400).json({ message: 'Invalid Credentials' });
            }
            sendTokenResponse(user, 200, res, 'Login successful (Local Mode)');
            return;
        }

        // MongoDB Logic
        if (email === 'admin@vastrakuteer.com' && password === 'admin123') {
            let adminUser = await User.findOne({ email });
            if (!adminUser) {
                adminUser = new User({ fullName: 'Vastra Admin', email, password, role: 'admin' });
                await adminUser.save();
            }
            sendTokenResponse(adminUser, 200, res, 'Admin Login successful');
            return;
        }

        let user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }
        sendTokenResponse(user, 200, res, 'Login successful');

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/send-login-otp
// @desc    Generate and email an OTP for secure login
// @access  Public
router.post('/send-login-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        // Check if user exists (vital for login)
        let user;
        if (mongoose.connection.readyState !== 1) {
            user = findUserByEmail(email);
        } else {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Cache it for 5 minutes (shorter for login)
        global.loginOTPs.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

        // Setup Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Vastra Kuteer Login OTP',
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #be185d; text-align: center;">Secure Login</h2>
                    <p>Hello ${user.fullName},</p>
                    <p>Your One-Time Password (OTP) for logging into Vastra Kuteer is:</p>
                    <div style="background: #fdf2f8; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #be185d; border-radius: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Vastra Kuteer. All rights reserved.</p>
                   </div>`
        };

        await transporter.sendMail(mailOptions);
        logDebug(`[LOGIN OTP SENT] ${email} - OTP: ${otp}`);

        res.json({ message: 'OTP sent to your email' });
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

        const cached = global.loginOTPs.get(email);
        if (!cached) return res.status(400).json({ message: 'OTP expired or not requested' });

        if (Date.now() > cached.expires) {
            global.loginOTPs.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }

        if (cached.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP Valid - Proceed to Login
        global.loginOTPs.delete(email);

        let user;
        if (mongoose.connection.readyState !== 1) {
            user = findUserByEmail(email);
        } else {
            user = await User.findOne({ email });
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

        // 1. Generate secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // 2. Hash token for saving in database (security best practice)
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 3600000; // 1 hr from now

        let user;
        if (mongoose.connection.readyState !== 1) {
            // JSON DB Mode (Basic mock implementation)
            user = findUserByEmail(email);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // In a real JSON db flow, we'd update jsonDb to store it, but for mock, just log it
            logDebug(`[FORGOT PW] JSON Mode reset token for ${email}: ${resetToken}`);
        } else {
            // MongoDB Mode
            user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });

            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpires = resetPasswordExpires;
            await user.save();
        }

        // 3. Create the Reset URL
        // In a real app, this should be the frontend URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        try {
            const sendEmail = require('../utils/sendEmail');
            const message = `You requested a password reset for Vastra Kuteer.\n\nPlease click this link to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

            const previewUrl = await sendEmail({
                email: user.email,
                subject: 'Vastra Kuteer - Password Reset',
                message
            });

            // Log so we can view the email in terminal
            logDebug(`\n==========================================`);
            logDebug(`TEST EMAIL SENT! VIEW IT HERE:`);
            logDebug(`${previewUrl}`);
            logDebug(`==========================================\n`);

            res.status(200).json({ message: 'Password reset link sent! Check terminal for the fast Email Preview link.' });

        } catch (error) {
            console.error('Email send error:', error);
            logDebug(`[FORGOT PW] Email send failed: ${error.message} - ${error.stack}`);
            // Revert changes if email fails
            if (mongoose.connection.readyState === 1 && user) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
            }
            res.status(500).json({ message: 'Error sending reset email. Please try again later.' });
        }

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ message: 'Server error processing request' });
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
        if (isNewUser) sendWelcomeEmail(name, email);

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
        if (isNewUser) sendWelcomeEmail(name || email, email);

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
        let users;
        if (mongoose.connection.readyState !== 1) {
            users = getAllUsers();
        } else {
            users = await User.find().select('-password');
        }

        // Strip passwords for JSON DB users (Mongo query already excludes them)
        const safeUsers = users.map(user => {
            const u = user.toObject ? user.toObject() : user;
            const { password, ...rest } = u;
            return rest;
        });

        res.json(safeUsers);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user by ID (admin only)
// @access  Admin
router.delete('/users/:id', admin, (req, res) => {
    try {
        const { id } = req.params;
        if (id === 'admin_static_id') {
            return res.status(400).json({ message: 'Cannot delete the main admin account' });
        }
        const remaining = deleteUserById(id);
        res.json({ message: 'User deleted', remaining: remaining.length });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
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
