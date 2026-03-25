const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { getCategories, saveCategory, updateCategory, deleteCategory } = require('../utils/categoryJsonDb');

// Helper to Check DB Connection
const isConnected = () => mongoose.connection.readyState === 1;

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
    try {
        if (!isConnected()) {
            return res.json(getCategories());
        }
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/categories
// @desc    Add a new category
// @access  Admin
router.post('/', async (req, res) => {
    try {
        if (!isConnected()) {
            const newCategory = saveCategory(req.body);
            return res.json(newCategory);
        }
        const newCategory = new Category(req.body);
        const category = await newCategory.save();
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        if (!isConnected()) {
            const category = updateCategory(req.params.id, req.body);
            if (!category) return res.status(404).json({ msg: 'Category not found' });
            return res.json(category);
        }
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });

        category = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        if (!isConnected()) {
            const success = deleteCategory(req.params.id);
            if (!success) return res.status(404).json({ msg: 'Category not found' });
            return res.json({ msg: 'Category removed' });
        }
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });

        await Category.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Category removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
