const express = require('express');
const dotenv = require('dotenv');

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});