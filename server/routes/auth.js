const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const { saveUser, findUserByEmail, getAllUsers, deleteUserById, updateUserById } = require('../utils/jsonDb');
const { auth, admin } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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
const sendTokenResponse = (user, statusCode, res, msg) => {
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
        user: {
            _id: user._id || user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Fallback to JSON DB if Mongo is offline
        if (mongoose.connection.readyState !== 1) {
            logDebug(`[REGISTER] Using JSON DB. Email: ${email}`);
            let user = findUserByEmail(email);
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            user = { fullName, email, password, role: 'user' };
            const savedUser = saveUser(user);
            sendTokenResponse(savedUser, 201, res, 'User registered successfully (Local Mode)');
            return;
        }

        // MongoDB Logic
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ fullName, email, password });
        await user.save();
        sendTokenResponse(user, 201, res, 'User registered successfully');

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
        if (mongoose.connection.readyState !== 1) {
            // JSON DB Mode
            user = findUserByEmail(email);
            if (!user) {
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

        sendTokenResponse(user, 200, res, 'Google Login successful');
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
        if (mongoose.connection.readyState !== 1) {
            user = findUserByEmail(email);
            if (!user) {
                user = { _id: Date.now().toString(), fullName: name || email, email, role: 'user', authProvider: 'google' };
                saveUser(user);
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
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
        sendTokenResponse(user, 200, res, 'Google Login successful');
    } catch (err) {
        console.error('Google Userinfo Auth Error:', err);
        res.status(500).json({ message: 'Google Sign-In failed' });
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
router.put('/users/:id/role', admin, (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }
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
