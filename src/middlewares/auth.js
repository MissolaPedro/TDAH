const { auth } = require('../../config/auth-firebase'); // Certifique-se de importar corretamente o auth do Firebase

function authMiddleware(req, res, next) {
    // Verifica se o usuário está logado
    const isLoggedIn = req.cookies.loggedIn;

    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    // Verifica se o usuário tem a sessão de usuário ativa
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    // Verifica se o e-mail foi verificado
    const user = auth.currentUser;
    if (user) {
        if (!user.emailVerified) {
            return res.redirect('/verify-email');
        }
    } else {
        return res.redirect('/login');
    }

    // Se tudo estiver ok, continua para a próxima função
    next();
}

module.exports = authMiddleware;