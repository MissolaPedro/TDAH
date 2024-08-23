const { auth, createUserWithEmailAndPassword } = require("../../../config/auth-firebase");

async function registrarUsuario(registeremail, registerpassword, req, callback) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, registeremail, registerpassword);
        
        // Adiciona o ID do usuário na sessão
        req.session.userId = userCredential.user.uid;
        
        if (callback && typeof callback === 'function') {
            callback(null, userCredential.user);
        }
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        if (callback && typeof callback === 'function') {
            callback(error, null);
        }
    }
}

module.exports = { registrarUsuario };