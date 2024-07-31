const { auth, createUserWithEmailAndPassword } = require("../../../config/auth-firebase");

function registrarUsuario(registeremail, registerpassword, callback) {
    createUserWithEmailAndPassword(auth, registeremail, registerpassword)
      .then((userCredential) => {
        callback(null, userCredential.user); // Sucesso
      })
      .catch((error) => {
        callback(error, null); // Erro
      });
}

module.exports = { registrarUsuario };