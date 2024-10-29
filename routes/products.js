const express = require('express');
const fs = require('fs');
const productsFilePath = './data/productos.json';

function readProducts() {
  const data = fs.readFileSync(productsFilePath, 'utf-8');
  return JSON.parse(data);
}

function writeProducts(products) {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
}

function generateId() {
  const products = readProducts();
  return products.length > 0 ? products[products.length - 1].id + 1 : 1;
}

// Exporta el router como una función que recibe io
module.exports = (io) => {
  const router = express.Router();

  // GET /api/products/ - Obtener todos los productos
  router.get('/', (req, res) => {
    const products = readProducts();
    res.json(products);
  });

  // POST /api/products/ - Crear un nuevo producto
  router.post('/', (req, res) => {
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

    // Emitir el evento de WebSocket
    io.emit('updateProducts', newProduct);

    res.status(201).json(newProduct);
  });

  // DELETE /api/products/:pid - Eliminar un producto
  router.delete('/:pid', (req, res) => {
    let products = readProducts();
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const deletedProduct = products[index];
    products.splice(index, 1);
    writeProducts(products);

    // Emitir el evento de eliminación por WebSocket
    io.emit('removeProduct', deletedProduct.id);

    res.json({ message: 'Producto eliminado' });
  });

  return router;
};
