const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const path = './data/carts.json';

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, '[]');
  }
}

// Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    const carts = JSON.parse(data);
    const id = (carts.length > 0 ? parseInt(carts[carts.length - 1].id) + 1 : 1).toString();
    const newCart = { id, products: [] };

    carts.push(newCart);
    await fs.writeFile(path, JSON.stringify(carts, null, 2));
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// Listar productos del carrito
router.get('/:cid', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    const carts = JSON.parse(data);
    const cart = carts.find((c) => c.id === req.params.cid);
    cart ? res.json(cart.products) : res.status(404).json({ error: 'Carrito no encontrado' });
  } catch (error) {
    console.error('Error en GET carritos:', error); // Añadido para ver el detalle
    res.status(500).json({ error: 'Error al leer el carrito' });
  }
});


// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    await ensureFileExists(path);
    const cartData = await fs.readFile(path, 'utf-8');
    const carts = JSON.parse(cartData);
    const cart = carts.find((c) => c.id === req.params.cid);

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex((p) => p.product === req.params.pid);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await fs.writeFile(path, JSON.stringify(carts, null, 2));
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
});

module.exports = router;
