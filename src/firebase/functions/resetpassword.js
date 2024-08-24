const { auth, sendPasswordResetEmail } = require("../../../config/auth-firebase");

async function sendPasswordResetEmailFirebase(email, req, callback) {
    try {
        await sendPasswordResetEmail(auth, email);
        if (callback && typeof callback === 'function') {
            callback(null, "E-mail de redefinição de senha enviado com sucesso.");
        }
    } catch (error) {
        console.error("Erro ao enviar e-mail de redefinição de senha:", error);
        if (callback && typeof callback === 'function') {
            callback("Erro ao enviar e-mail de redefinição de senha.", null);
        }
    }
}

module.exports = { sendPasswordResetEmailFirebase };