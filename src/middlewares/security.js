const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csrf');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { firestoreAdmin } = require('../../config/configsFirebase'); // Importar Firestore Admin

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const tokens = new csrf();

const configureHelmet = (app) => {
  app.use(helmet());
  /*
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted.cdn.com", "https://kit.fontawesome.com"],
      styleSrc: ["'self'", "https://trusted.cdn.com", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://trusted.cdn.com", "https://i.imgur.com", "https://imgur.com"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com"],
      fontSrc: ["'self'", "https://trusted.cdn.com", "https://fonts.gstatic.com", "https://kit.fontawesome.com", "https://ka-f.fontawesome.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      reportUri: "/csp-violation-report-endpoint",
      sandbox: ["allow-forms", "allow-scripts"],
      upgradeInsecureRequests: [],
    },
  }));
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
  */
};

const configureSessionAndCookies = (app) => {
  app.use(cookieParser(process.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
  }));
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
};

const configureCSRF = (app) => {
  app.use(async (req, res, next) => {
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
      await firestoreAdmin.collection('csrfTokens').doc(req.sessionID).set({
        csrfSecret: req.session.csrfSecret
      });
    }
    req.csrfToken = () => tokens.create(req.session.csrfSecret);
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use(async (req, res, next) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    //console.log(`Origin: ${origin}`);
    //console.log(`Referer: ${referer}`);
    //console.log(`Host: ${host}`);

    if (req.method === 'POST') {
      const token = req.body._csrf || req.query._csrf || req.headers['csrf-token'];
      const doc = await firestoreAdmin.collection('csrfTokens').doc(req.sessionID).get();
      const csrfSecret = doc.data().csrfSecret;

      if (!tokens.verify(csrfSecret, token)) {
        return res.status(403).send('CSRF token inválido');
      }

      if (origin && origin !== `https://${host}` && origin !== `http://${host}` && origin !== 'null') {
        return res.status(403).send('Origem inválida');
      }

      if (referer && !referer.startsWith(`https://${host}`) && !referer.startsWith(`http://${host}`)) {
        return res.status(403).send('Referer inválido');
      }
    }
    next();
  });
};

const setHeadersForTesting = (req, res, next) => {
  if (!req.headers.origin) {
    req.headers.origin = `https://${req.headers.host}`;
  }
  if (!req.headers.referer) {
    req.headers.referer = `https://${req.headers.host}/`;
  }
  next();
};

module.exports = (app) => {
  if (!app || typeof app.use !== 'function') {
    throw new TypeError('Expected app to be an instance of express');
  }

  app.use(setHeadersForTesting); // Adiciona cabeçalhos para fins de teste antes de outros middlewares

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  configureHelmet(app);
  configureSessionAndCookies(app);
  configureCSRF(app);
};