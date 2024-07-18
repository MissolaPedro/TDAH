const { auth, createUserWithEmailAndPassword } = require("../../../config/auth-firebase");

function registrarUsuario(email, senha, callback) {
    createUserWithEmailAndPassword(auth, email, senha)
      .then((userCredential) => {
        callback(null, userCredential.user); // Sucesso
      })
      .catch((error) => {
        callback(error, null); // Erro
      });
}

module.exports = { registrarUsuario };