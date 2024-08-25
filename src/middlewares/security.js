const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const csrf = require('csrf');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

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

/*
const configureCSRF = (app) => {
  app.use((req, res, next) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = tokens.create(tokens.secretSync());
    }
    req.csrfToken = () => req.session.csrfToken;
    res.locals.csrfToken = req.session.csrfToken;
    next();
  });

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    if (req.method === 'POST') {
      const token = req.body._csrf || req.query._csrf || req.headers['csrf-token'];
      if (!token || token !== req.session.csrfToken) {
        return res.status(403).send('CSRF token inválido');
      }

      const isLocalhost = (url) => {
        try {
          const { hostname, port } = new URL(url);
          return hostname === 'localhost' && port === '80';
        } catch (e) {
          return false;
        }
      };

      if (origin && !isLocalhost(origin)) {
        return res.status(403).send('Origem inválida');
      }

      if (referer && !isLocalhost(referer)) {
        return res.status(403).send('Referer inválido');
      }
    }
    next();
  });
};
*/

/*
const configureCSRF = (app) => {
  app.use((req, res, next) => {
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }
    req.csrfToken = () => tokens.create(req.session.csrfSecret);
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const host = req.headers.host;

    if (req.method === 'POST') {
      const token = req.body._csrf || req.query._csrf || req.headers['csrf-token'];
      if (!tokens.verify(req.session.csrfSecret, token)) {
        return res.status(403).send('CSRF token inválido');
      }

      if (origin && origin !== `https://${host}`) {
        return res.status(403).send('Origem inválida');
      }

      if (referer && !referer.startsWith(`https://${host}`)) {
        return res.status(403).send('Referer inválido');
      }
    }
    next();
  });
};
*/

module.exports = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  configureHelmet(app);
  configureSessionAndCookies(app);
  //configureCSRF(app);
};