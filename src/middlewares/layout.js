const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

module.exports = (app) => {
  app.use(expressLayouts);
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, '..', '..', 'public')));
};