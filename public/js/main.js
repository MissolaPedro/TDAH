// Importações de módulos
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

// Inicialização do Express
const app = express();

// Configurações do cookie de sessão para uso seguro
app.use(session({
  secret: '2b0589e317f0ed915feacb2865eec8ea2d5c077bfb08f1e01e820451eb67afdf1be7367733aeba16c1e6e46837cdcf848a27097ae2a6d324bb7b0e8ac4535c1e',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Defina como false se não estiver usando HTTPS
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
  }
}));

// Middleware para parsear o corpo das requisições e cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configurações do Express, EJS e layouts
app.use(expressLayouts);
app.set('views', path.join(__dirname, '..', '..', 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Importação e utilização de rotas
const routeEJS = require('../../src/routes/routeEJS.js');
routeEJS(app);

// Configuração do servidor HTTP
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});