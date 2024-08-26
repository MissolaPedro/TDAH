module.exports = (app) => {
  // Middleware para capturar erros 404 (Not Found)
  app.use((req, res, next) => {
    res.status(404).render('404', {
      title: 'Página Não Encontrada',
      errorMessage: 'A página que você está procurando não existe.',
    });
  });

  // Middleware de Tratamento de Erros
  app.use((err, req, res, next) => {
    //console.error(err.stack);

    // Verifica o ambiente
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Renderiza uma página de erro com detalhes em desenvolvimento
    if (isDevelopment) {
      res.status(500).render('error', {
        title: 'Erro Interno do Servidor',
        errorMessage: 'Algo deu errado!',
        errorDetails: err.stack,
      });
    } else {
      // Renderiza uma página de erro genérica em produção
      res.status(500).render('error', {
        title: 'Erro Interno do Servidor',
        errorMessage: 'Algo deu errado!',
        errorDetails: null,
      });
    }
  });
};