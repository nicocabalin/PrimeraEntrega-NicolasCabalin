const express = require('express');
const fs = require('fs');
const router = express.Router();

const productsFilePath = './data/productos.json';

// Leer productos desde el archivo JSON
function readProducts() {
  const data = fs.readFileSync(productsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Guardar productos en el archivo JSON
function writeProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

// Generar un nuevo ID para el producto
function generateId() {
  const products = readProducts();
  return products.length > 0 ? products[products.length - 1].id + 1 : 1;
}

// Rutas

// GET /api/products/ - Obtener todos los productos
router.get('/', (req, res) => {
  const limit = req.query.limit;
  let products = readProducts();
  if (limit) {
    products = products.slice(0, parseInt(limit));
  }
  res.json(products);
});

// GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id == req.params.pid);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(product);
});

// POST /api/products/ - Crear un nuevo producto
router.post('/', (req, res) => {
  console.log('Solicitud POST recibida para crear un producto');
  
  const { title, description, code, price, stock, category, thumbnails, status } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
  }

  const newProduct = {
    id: generateId(),
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: status !== undefined ? status : true
  };

  const products = readProducts();
  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// PUT /api/products/:pid - Actualizar un producto
router.put('/:pid', (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => p.id == req.params.pid);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const updatedProduct = { ...products[index], ...req.body };
  if (req.body.id) {
    return res.status(400).json({ error: 'No se puede actualizar el id del producto' });
  }

  products[index] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// DELETE /api/products/:pid - Eliminar un producto
router.delete('/:pid', (req, res) => {
  let products = readProducts();
  const index = products.findIndex(p => p.id == req.params.pid);
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  products = products.filter(p => p.id != req.params.pid);
  writeProducts(products);

  res.json({ message: 'Producto eliminado' });
});

module.exports = router;
