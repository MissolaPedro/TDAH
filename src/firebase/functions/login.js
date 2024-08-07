const { auth, signInWithEmailAndPassword } = require("../../../config/auth-firebase");
const session = require('express-session'); // Assumindo que express-session está configurado globalmente

function signInUser(loginemail, loginpassword, loginrememberMe, req, callback) {
    // console.log("Tentando fazer login com:", { loginemail, loginpassword, loginrememberMe });

    signInWithEmailAndPassword(auth, loginemail, loginpassword)
        .then((userCredential) => {
            // console.log("Login bem-sucedido:", userCredential.user);

            // Configura a sessão aqui
            req.session.userId = userCredential.user.uid; // Armazena o UID do usuário na sessão
            if (loginrememberMe) {
                // Define a duração da sessão para 30 dias se "Lembrar de Mim" estiver marcado
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
            } else {
                // Faz a sessão expirar ao fechar o navegador se "Lembrar de Mim" não estiver marcado
                req.session.cookie.expires = false;
            }
            if (typeof callback === 'function') {
                callback(null, userCredential.user); // Sucesso
            }
        })
        .catch((error) => {
            // console.error("Erro ao fazer login:", error);
            if (typeof callback === 'function') {
                callback(error, null); // Erro
            }
        });
}

module.exports = { signInUser };