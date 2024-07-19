const { auth, signInWithEmailAndPassword, signOut} = require("../../../config/auth-firebase");

function signInUser(email, password, callback) {
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            callback(null, userCredential.user); // Sucesso
        })
        .catch((error) => {
            callback(error, null); // Erro
        });
}

module.exports = { signInUser };