// Importações de módulos
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

const app = express();

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

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(expressLayouts);
app.set('views', path.join(__dirname, '..', '..', 'src', 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

const routeEJS = require('../../src/routes/routeEJS.js');
routeEJS(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});