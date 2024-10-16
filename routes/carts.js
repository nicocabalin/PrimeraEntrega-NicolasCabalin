const express = require('express');
const fs = require('fs');
const router = express.Router();

const cartsFilePath = './data/carrito.json';
const productsFilePath = './data/productos.json';

// Leer carritos desde el archivo JSON
function readCarts() {
  const data = fs.readFileSync(cartsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Guardar carritos en el archivo JSON
function writeCarts(carts) {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

// Leer productos
function readProducts() {
  const data = fs.readFileSync(productsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Generar un nuevo ID para el carrito
function generateCartId() {
  const carts = readCarts();
  return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
}

// Rutas

// POST /api/carts/ - Crear un nuevo carrito
router.post('/', (req, res) => {
  const newCart = {
    id: generateCartId(),
    products: []
  };

  const carts = readCarts();
  carts.push(newCart);
  writeCarts(carts);

  res.status(201).json(newCart);
});

// GET /api/carts/:cid - Listar productos de un carrito
router.get('/:cid', (req, res) => {
  const carts = readCarts();
  const cart = carts.find(c => c.id == req.params.cid);
  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// POST /api/carts/:cid/product/:pid - Agregar producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readCarts();
  const products = readProducts();
  const cart = carts.find(c => c.id == req.params.cid);
  const product = products.find(p => p.id == req.params.pid);

  if (!cart || !product) {
    return res.status(404).json({ error: 'Carrito o producto no encontrado' });
  }

  const cartProduct = cart.products.find(p => p.product == req.params.pid);
  if (cartProduct) {
    cartProduct.quantity += 1;
  } else {
    cart.products.push({ product: req.params.pid, quantity: 1 });
  }

  writeCarts(carts);
  res.json(cart);
});

module.exports = router;
