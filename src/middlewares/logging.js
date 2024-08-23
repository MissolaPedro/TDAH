const morgan = require('morgan');
const { validationResult } = require('express-validator');
const { insertLog } = require('../firebase/inserts/insertLogs'); // Importa a função de inserção de logs

module.exports = (app) => {
  // Formato de log personalizado
  morgan.token('date', () => new Date().toISOString());
  const customFormat = ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';

  // Middleware de logging
  app.use(morgan(customFormat, {
    skip: (req, res) => res.statusCode < 400, // Log apenas erros no console
    stream: {
      write: (message) => {
        const logData = {
          message,
          timestamp: new Date().toISOString()
        };
        // console.log('Tentando inserir log de acesso'); // Log de depuração
        insertLog(logData, 'accessLogs');
      }
    }
  }));

  // Middleware de logging para cada rota
  const routes = ['login', 'register', 'logout', 'resetpassword', 'contact'];
  routes.forEach(route => {
    app.use(`/${route}`, morgan(customFormat, {
      stream: {
        write: (message) => {
          const logData = {
            message,
            timestamp: new Date().toISOString()
          };
          // console.log(`Tentando inserir log para a rota: ${route}`); // Log de depuração
          insertLog(logData, `${route}Logs`);
        }
      }
    }));
  });

  // Middleware para registrar erros gerais
  app.use((err, req, res, next) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack
    };
    // console.log('Tentando inserir log de erro'); // Log de depuração
    insertLog(errorLog, 'errorLogs');
    next(err);
  });

  // Middleware para registrar erros de validação
  app.use((req, res, next) => {
    if (req.method === 'POST') {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationLog = {
          timestamp: new Date().toISOString(),
          errors: errors.array()
        };
        // console.log('Tentando inserir log de validação'); // Log de depuração
        insertLog(validationLog, 'validationLogs');
      }
    }
    next();
  });
};