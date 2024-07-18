const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true })); // Middleware para parsear o corpo das requisições POST

// Configurações do Express e EJS
app.set('views', path.join(__dirname, '..', '..', 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Importação e utilização de routeEJS
const routeEJS = require('../../src/routes/routeEJS.js');
routeEJS(app);

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});