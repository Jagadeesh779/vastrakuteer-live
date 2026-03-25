const express = require('express');
const router = express.Router();
const { findUserByEmail, updateUser } = require('../utils/jsonDb');

// Helper to get user from mock DB (since we are not using Mongo middleware properly everywhere yet)
// In a real app, middleware would attach user to req
const getUser = (email) => {
    return findUserByEmail(email);
};

// @route   POST /api/user/address
// @desc    Add a new address
// @access  Private (Mock)
router.post('/address', (req, res) => {
    const { email, address } = req.body; // Expecting email in body for now as simple auth

    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses = user.addresses || [];

        // Limit to 5 addresses
        if (user.addresses.length >= 5) {
            return res.status(400).json({ message: 'Maximum 5 addresses allowed' });
        }

        const newAddress = {
            id: Date.now().toString(),
            ...address
        };

        user.addresses.push(newAddress);
        updateUser(user);

        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/user/address
// @desc    Get user addresses
// @access  Private
router.post('/get-addresses', (req, res) => {
    const { email } = req.body;
    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.addresses || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/user/address/:id
// @desc    Delete an address
// @access  Private
router.post('/delete-address', (req, res) => {
    const { email, addressId } = req.body;
    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.addresses = user.addresses || [];
        user.addresses = user.addresses.filter(addr => addr.id !== addressId);

        updateUser(user);
        res.json(user.addresses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




// @route   POST /api/user/add-favorite
// @desc    Add product to favorites
// @access  Private
router.post('/add-favorite', (req, res) => {
    const { email, productId } = req.body;
    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites || [];
        if (!user.favorites.includes(productId)) {
            user.favorites.push(productId);
            updateUser(user);
        }
        res.json(user.favorites);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/user/remove-favorite
// @desc    Remove product from favorites
// @access  Private
router.post('/remove-favorite', (req, res) => {
    const { email, productId } = req.body;
    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.favorites = user.favorites || [];
        user.favorites = user.favorites.filter(id => id !== productId);
        updateUser(user);
        res.json(user.favorites);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/user/get-favorites
// @desc    Get user favorites
// @access  Private
router.post('/get-favorites', (req, res) => {
    const { email } = req.body;
    try {
        const user = getUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.favorites || []);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
