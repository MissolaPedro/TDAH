const admin = require('firebase-admin');

// Middleware para checar se o usuário está autenticado e o e-mail está verificado
async function authMiddleware(req, res, next) {
    const isLoggedIn = req.cookies.loggedIn;

    if (!isLoggedIn) {
        return res.redirect('/login');
    }

    if (!req.cookies.session) {
        return res.redirect('/login');
    }

    try {
        const decodedClaims = await admin.auth().verifySessionCookie(req.cookies.session, true);
        if (decodedClaims.email_verified) {
            req.user = decodedClaims;
            next();
        } else {
            res.redirect('/verify-email');
        }
    } catch (error) {
        //console.error('Erro ao verificar usuário:', error);
        res.redirect('/login');
    }
}

module.exports = authMiddleware;