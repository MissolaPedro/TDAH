const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');
const authMiddleware = require('./src/middlewares/auth'); // Importar o middleware de autenticação

dotenv.config();

const app = express();

// Importação de Middlewares
require('./src/middlewares/security')(app);
// require('./src/middlewares/logging')(app);
require('./src/middlewares/parsing')(app);
require('./src/middlewares/layout')(app);

// Importação de Rotas
const routeGet = require('./src/routes/routeGet');
routeGet(app);

const routePost = require('./src/routes/routePost');
routePost(app);

// Aplicar o middleware de autenticação às rotas que precisam de proteção
app.use('/protected-route', authMiddleware, (req, res) => {
    res.send('Esta é uma rota protegida');
});

// Middleware de Tratamento de Erros
require('./src/middlewares/errorHandler')(app);

const port = process.env.PORT || 80;

if (process.env.NODE_ENV === 'development') {
  const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };

  https.createServer(options, app).listen(port, () => {
    console.log(`Servidor HTTPS rodando em https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}