const { auth, signInWithEmailAndPassword } = require("../../../config/auth-firebase");

async function signInUser(loginemail, loginpassword, loginrememberMe, req, callback) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, loginemail, loginpassword);
        
        req.session.userId = userCredential.user.uid;
        if (loginrememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 dias
        } else {
            req.session.cookie.expires = false;
        }
        
        if (callback && typeof callback === 'function') {
            callback(null, userCredential.user);
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        if (callback && typeof callback === 'function') {
            callback(error, null);
        }
    }
}

module.exports = { signInUser };