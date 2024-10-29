const express = require('express');
const fs = require('fs').promises;
const router = express.Router();
const path = './data/products.json';

// Función para asegurar que el archivo exista y esté inicializado
async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch (err) {
    await fs.writeFile(filePath, '[]');
  }
}

// Obtener todos los productos con limitación opcional
router.get('/', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    let products = JSON.parse(data);
    const limit = req.query.limit;
    if (limit) products = products.slice(0, Number(limit));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos' });
  }
});

// Obtener producto por ID
router.get('/:pid', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    const products = JSON.parse(data);
    const product = products.find((p) => p.id === req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos' });
  }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    const products = JSON.parse(data);
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const id = (products.length > 0 ? parseInt(products[products.length - 1].id) + 1 : 1).toString();
    const newProduct = { id, title, description, code, price, status, stock, category, thumbnails };
    products.push(newProduct);

    await fs.writeFile(path, JSON.stringify(products, null, 2));
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error en POST productos:', error); // Añadido para ver el detalle
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
});


// Actualizar un producto
router.put('/:pid', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    const products = JSON.parse(data);
    const productIndex = products.findIndex((p) => p.id === req.params.pid);

    if (productIndex === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const updatedProduct = { ...products[productIndex], title, description, code, price, status, stock, category, thumbnails };
    products[productIndex] = updatedProduct;

    await fs.writeFile(path, JSON.stringify(products, null, 2));
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    await ensureFileExists(path);
    const data = await fs.readFile(path, 'utf-8');
    let products = JSON.parse(data);
    products = products.filter((p) => p.id !== req.params.pid);

    await fs.writeFile(path, JSON.stringify(products, null, 2));
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
