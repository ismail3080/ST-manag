const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/item');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the "frontend" directory
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Homepage route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'home.html'));
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search for products by name or reference
app.get('/api/products/search', async (req, res) => {
    try {
        let query = {};
        if (req.query.search) {
            const searchTerm = req.query.search.toLowerCase();
            query = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search by name
                    { reference: { $regex: searchTerm, $options: 'i' } } // Case-insensitive search by reference
                ]
            };
        }
        const products = await Product.find(query);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a product by ID
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Delete a product by reference
app.delete('/api/products/:reference', async (req, res) => {
    try {
        const reference = req.params.reference;
        const product = await Product.findOneAndDelete({ reference: reference });
        if (product) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



mongoose.connect('mongodb+srv://senior:seniorsenior@cluster0.0jdjvp1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log('Connected!')
    app.listen(3000, ()=>{
        console.log('server running on port 3000');
    
    });
})
.catch (() =>{
    console.log('connection failed!')
});

