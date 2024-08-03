const { auth, signOut } = require("../../../config/auth-firebase");

function signOutUser(callback) {
    signOut(auth).then(() => {
        callback(null); // Sign-out successful.
        console.log("Usuário deslogado com sucesso");
    }).catch((error) => {
        callback(error); // An error happened.
        console.log(error);
    });
}

module.exports = { signOutUser };