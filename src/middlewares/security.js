const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csrf');
const cookieParser = require('cookie-parser');
const { body, validationResult } = require('express-validator');

const tokens = new csrf();

module.exports = (app) => {
  // Configurar Helmet com cabeçalhos de segurança adicionais
  app.use(helmet());
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://trusted.cdn.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://trusted.cdn.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }));
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));

  // Configurar cookies de forma segura
  app.use(cookieParser());
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
    }
  }));

  // Middleware para analisar o corpo da requisição
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Middleware para adicionar proteção CSRF
  app.use((req, res, next) => {
    if (!req.session.csrfSecret) {
        req.session.csrfSecret = tokens.secretSync();
    }
    req.csrfToken = () => tokens.create(req.session.csrfSecret); // Adiciona a função csrfToken ao objeto req
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((req, res, next) => {
    if (req.method === 'POST') {
        const token = req.body._csrf || req.query._csrf || req.headers['csrf-token'];
        if (!tokens.verify(req.session.csrfSecret, token)) {
            return res.status(403).send('CSRF token inválido');
        }
    }
    next();
  });

  // Middleware para validar e sanitizar dados de entrada
  app.post('/login', [
    body('loginemail').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('loginpassword').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres').trim().escape()
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  });

  app.post('/register', [
    body('registeremail').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('registerpassword').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres').trim().escape(),
    body('registerconfirmpassword').custom((value, { req }) => {
      if (value !== req.body.registerpassword) {
        throw new Error('Confirmação de senha não corresponde à senha');
      }
      return true;
    }).trim().escape()
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  });

  app.post('/resetpassword', [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail()
  ], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  });
};