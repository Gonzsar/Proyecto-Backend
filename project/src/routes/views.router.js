import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const viewsRouter = Router();
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePath = join(__dirname, 'products.json');


const readProducts = () => {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo el archivo de productos:', error);
        return [];
    }
};

viewsRouter.get('/', (req, res) => {
    const products = readProducts();
    res.render('home', { title: 'Inicio', products });
});

viewsRouter.get('/realtimeproducts', (req, res) => {
    const products = readProducts();
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real', products });
});

export default viewsRouter;
