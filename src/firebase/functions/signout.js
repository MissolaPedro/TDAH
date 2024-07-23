const { auth, signOut } = require("../../../config/auth-firebase");

function signOutUser(callback) {
    signOut(auth).then(() => {
        callback(null); // Sign-out successful.
    }).catch((error) => {
        callback(error); // An error happened.
    });
}

module.exports = { signOutUser };