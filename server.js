const express = require('express');
const cors = require('cors');
const path = require('path');
const { create } = require('express-handlebars');
const http = require('http');
const { Server } = require('socket.io');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
const port = 8080;
const server = http.createServer(app);
const io = new Server(server);

// Configuración de Handlebars
const hbs = create({
  extname: '.handlebars',
});
app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración para permitir que otros módulos accedan a io
app.set('io', io);

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta raíz que renderiza home.handlebars
app.get('/', (req, res) => {
  // Renderizar home sin productos al inicio
  res.render('home', { products: [] });
});

// Ruta para la vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', { products: [] }); // Renderizar realTimeProducts
});

// Configuración de socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Escucha para cuando se crea un nuevo producto
  socket.on('newProduct', (product) => {
    io.emit('updateProducts', product);
  });

  // Escucha para cuando se elimina un producto
  socket.on('deleteProduct', (productId) => {
    io.emit('removeProduct', productId);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
