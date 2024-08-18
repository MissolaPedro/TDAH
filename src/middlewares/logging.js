const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');

module.exports = (app) => {
  // Cria um stream de rotação de arquivos
  const logDirectory = path.resolve(__dirname, '../auth/log');
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d', // rotaciona diariamente
    path: logDirectory
  });

  // Formato de log personalizado
  morgan.token('date', () => new Date().toISOString());
  const customFormat = ':remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';

  // Middleware de logging
  app.use(morgan(customFormat, {
    skip: (req, res) => res.statusCode < 400, // Log apenas erros no console
    stream: process.stdout
  }));

  app.use(morgan('combined', { stream: accessLogStream }));
};