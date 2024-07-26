const { auth } = require("../../../config/auth-firebase");
const { sendPasswordResetEmail } = require("firebase/auth");

function sendPasswordResetEmailFirebase(email, callback) {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      callback(null, "E-mail de redefinição de senha enviado com sucesso.");
    })
    .catch((error) => {
      callback("Erro ao enviar e-mail de redefinição de senha.", null);
    });
}

module.exports = { sendPasswordResetEmailFirebase };