const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');
const { getProducts, saveProduct } = require('../utils/productJsonDb');

const isConnected = () => mongoose.connection.readyState === 1;

// Multer setup for CSV
const upload = multer({ dest: 'uploads/csv/' });

// POST /api/admin/import-csv — Bulk import products from CSV
router.post('/import-csv', admin, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const content = fs.readFileSync(req.file.path, 'utf8');
        const lines = content.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        const products = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
            if (values.length < 3) continue;
            const obj = {};
            headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });

            products.push({
                brand: obj.brand || 'Vastra Kuteer',
                name: obj.name,
                price: Number(obj.price) || 0,
                originalPrice: Number(obj.originalPrice) || Number(obj.price) || 0,
                category: obj.category || 'Sarees',
                image: obj.image || '',
                count: Number(obj.count) || 10,
                rating: Number(obj.rating) || 4.5,
                showOnHome: obj.showOnHome === 'true',
                showOnShop: obj.showOnShop !== 'false',
                showOnCollections: obj.showOnCollections !== 'false',
            });
        }

        if (products.length === 0) return res.status(400).json({ error: 'No valid products found in CSV' });

        await Product.insertMany(products);
        fs.unlinkSync(req.file.path); // cleanup
        res.json({ success: true, imported: products.length, products });
    } catch (err) {
        console.error('CSV import error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/send-email — Send custom email to a user
router.post('/send-email', admin, async (req, res) => {
    const { to, subject, message } = req.body;
    if (!to || !subject || !message) return res.status(400).json({ error: 'to, subject, message required' });

    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        await transporter.sendMail({
            from: `"Vastra Kuteer" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:30px;background:#F8F8FF;border-radius:12px;">
                    <h1 style="color:#065f46;text-align:center;">Vastra Kuteer</h1>
                    <div style="white-space:pre-wrap;color:#333;line-height:1.8;">${message.replace(/\n/g, '<br/>')}</div>
                    <p style="color:#999;font-size:12px;margin-top:30px;">— Vastra Kuteer Team</p>
                </div>
            `
        });
        res.json({ success: true });
    } catch (err) {
        console.error('Send email error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/duplicate-product/:id — Clone a product
router.post('/duplicate-product/:id', admin, async (req, res) => {
    try {
        if (!isConnected()) {
            // JSON DB fallback
            const products = getProducts();
            const original = products.find(p => p._id === req.params.id);
            if (!original) return res.status(404).json({ error: 'Product not found' });
            const clone = {
                ...original,
                _id: Date.now().toString(),
                name: original.name + ' (Copy)',
                createdAt: new Date().toISOString()
            };
            saveProduct(clone);
            return res.json(clone);
        }

        // MongoDB mode
        const original = await Product.findById(req.params.id).lean();
        if (!original) return res.status(404).json({ error: 'Product not found' });
        delete original._id;
        delete original.__v;
        original.name = original.name + ' (Copy)';
        original.createdAt = new Date();
        const clone = await Product.create(original);
        res.json(clone);
    } catch (err) {
        console.error('Duplicate product error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
