const express = require('express');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');

dotenv.config();

const app = express();

// Importação de Middlewares
require('./src/middlewares/security')(app);
require('./src/middlewares/logging')(app);
require('./src/middlewares/parsing')(app);
require('./src/middlewares/layout')(app);

// Importação de Rotas
const routeGet = require('./src/routes/routeGet');
routeGet(app);

const routePost = require('./src/routes/routePost');
routePost(app);

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