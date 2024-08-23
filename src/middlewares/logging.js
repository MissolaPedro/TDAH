const morgan = require('morgan');
const { validationResult } = require('express-validator');

module.exports = (app) => {
  // Formato de log personalizado
  morgan.token('date', () => new Date().toISOString());
  const customFormat = ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';

  // Middleware de logging
  app.use(morgan(customFormat, {
    skip: (req, res) => res.statusCode < 400, // Log apenas erros no console
    stream: {
      write: (message) => {
        console.log({
          message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }));

  // Middleware de logging para cada rota
  const routes = ['login', 'register', 'logout', 'resetpassword', 'contact'];
  routes.forEach(route => {
    app.use(`/${route}`, morgan(customFormat, {
      stream: {
        write: (message) => {
          console.log({
            message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }));
  });

  // Middleware para registrar erros gerais
  app.use((err, req, res, next) => {
    console.error({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack
    });
    next(err);
  });

  // Middleware para registrar erros de validação
  app.use((req, res, next) => {
    if (req.method === 'POST') {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.warn({
          timestamp: new Date().toISOString(),
          errors: errors.array()
        });
      }
    }
    next();
  });
};