const express = require('express');
const router = express.Router();
const Item = require('../models/item'); // Assuming your item model is defined in item.js

// GET all products
router.get('/', async (req, res) => {
    try {
        const products = await Item.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET a specific product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Item.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST a new product
router.post('/', async (req, res) => {
    const product = new Item({
        name: req.body.name,
        reference: req.body.reference,
        quantity: req.body.quantity,
        buyingPrice: req.body.buyingPrice,
        sellingPrice: req.body.sellingPrice,
        priceDifference: req.body.priceDifference,
        currency: req.body.currency,
        barcode: req.body.barcode
    });
    try {
        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update an existing product by ID
router.put('/:id', async (req, res) => {
    try {
        const product = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE a product by ID
router.delete('/:id', async (req, res) => {
    try {
        const product = await Item.findByIdAndDelete(req.params.id);
        if (product) {
            res.json({ message: 'Product deleted' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
