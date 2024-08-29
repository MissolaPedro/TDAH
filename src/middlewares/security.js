const express = require('express');
// const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csrf');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { firestoreAdmin } = require('../../config/configsFirebase'); // Importar Firestore Admin

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const tokens = new csrf();

const configureHelmet = (app) => {
  // app.use(helmet());
  // app.use(helmet.contentSecurityPolicy({
  //   directives: {
  //     defaultSrc: ["'self'", "http://localhost", "https://localhost"],
  //     scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost", "https://localhost", "https://localhost:80/js", "https://localhost:80/src", "https://kit.fontawesome.com"],
  //     styleSrc: ["'self'", "'unsafe-inline'", "http://localhost", "https://localhost", "https://localhost:80/css", "https://localhost:80/src", "https://fonts.googleapis.com"],
  //     imgSrc: ["'self'", "data:", "http://localhost", "https://localhost", "https://localhost:80/image", "https://localhost:80/src"],
  //     connectSrc: ["'self'", "http://localhost", "https://localhost", "https://localhost:80/src"],
  //     fontSrc: ["'self'", "http://localhost", "https://localhost", "https://localhost:80/fonts", "https://localhost:80/src", "https://fonts.gstatic.com"],
  //     objectSrc: ["'none'"],
  //     frameAncestors: ["'self'"],
  //     reportUri: "/csp-violation-report-endpoint",
  //     sandbox: ["allow-forms", "allow-scripts"],
  //     upgradeInsecureRequests: [],
  //   },
  // }));
  // app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
};

const configureCORS = (app) => {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Origin", "https://localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
  });
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
    rolling: true, // Redefine o tempo de expiração a cada solicitação
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 1000 // 24 horas
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

  // configureHelmet(app);
  configureCORS(app);
  configureSessionAndCookies(app);
  configureCSRF(app);
};
