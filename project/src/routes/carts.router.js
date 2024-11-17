import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const cartsRouter = Router();

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'carts.json');

const productsPath = path.join(__dirname, '../data/products.json');

// Leer datos desde un archivo
const readData = (file) => {
    if (!fs.existsSync(file)) return [];
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
};

// Guardar datos en un archivo
const saveData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
};

// Crear un nuevo carrito
cartsRouter.post('/', (req, res) => {
    const carts = readData(filePath);
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: [],
    };
    carts.push(newCart);
    saveData(filePath, carts);
    res.status(201).json(newCart);
});

// Obtener los productos de un carrito
cartsRouter.get('/:cid', (req, res) => {
    const carts = readData(filePath);
    const cart = carts.find((c) => c.id === parseInt(req.params.cid));
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
});

// Agregar un producto a un carrito
cartsRouter.post('/:cid/product/:pid', (req, res) => {
    try {
        const carts = readData(filePath);
        const products = readData(productsPath);

        const cart = carts.find((c) => c.id === parseInt(req.params.cid));
        if (!cart) throw new Error('Carrito no encontrado');

        const product = products.find((p) => p.id === parseInt(req.params.pid));
        if (!product) throw new Error('Producto no encontrado');

        const cartProduct = cart.products.find((p) => p.product === product.id);
        if (cartProduct) {
            cartProduct.quantity = Math.max(cartProduct.quantity + 1, 0);
        } else {
            cart.products.push({ product: product.id, quantity: 1 });
        }

        saveData(filePath, carts);
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


export default cartsRouter;
