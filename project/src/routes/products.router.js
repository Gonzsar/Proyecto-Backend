import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const productsRouter = Router();
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'products.json');


const readProducts = () => {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const writeProducts = (products) => {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
};

productsRouter.get('/', (req, res) => {
    const limit = parseInt(req.query.limit);
    const products = readProducts();
    res.json(limit ? products.slice(0, limit) : products);
});

productsRouter.get('/:pid', (req, res) => {
    const products = readProducts();
    const product = products.find((p) => p.id === req.params.pid);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

productsRouter.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const products = readProducts();
    const newProduct = { id: uuidv4(), title, description, code, price, status, stock, category, thumbnails };
    products.push(newProduct);
    writeProducts(products);

    // Emitir actualización de productos
    const { io } = require('../server');
    io.emit('updateProducts', products);

    res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    const products = readProducts();
    const index = products.findIndex((p) => p.id === req.params.pid);
    if (index === -1) return res.status(404).json({ error: 'Product not found' });

    const updatedProduct = { ...products[index], ...req.body };
    products[index] = updatedProduct;
    writeProducts(products);

    res.json(updatedProduct);
});

productsRouter.delete('/:pid', (req, res) => {
    let products = readProducts();
    products = products.filter((p) => p.id !== req.params.pid);
    writeProducts(products);

    // Emitir actualización de productos
    const { io } = require('../server');
    io.emit('updateProducts', products);

    res.status(204).send();
});

export default productsRouter;
