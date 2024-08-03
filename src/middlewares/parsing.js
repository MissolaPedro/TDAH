const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = (app) => {
  // Middleware para analisar URLs codificadas
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Middleware para analisar JSON
  app.use(express.json({ limit: '10kb' }));

  // Middleware para analisar cookies
  app.use(cookieParser());

  // Middleware para analisar dados brutos
  app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));

  // Middleware para analisar texto
  app.use(bodyParser.text({ type: 'text/html' }));
};