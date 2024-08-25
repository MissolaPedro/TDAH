const { authAdmin, firestoreAdmin } = require('../../../config/configsFirebase');
const { getAuth } = require('firebase-admin/auth');

async function signOutUser(req, res) {
    const userToken = req.cookies.session;
    if (!userToken) {
        return res.status(400).json({ error: 'Usuário não está logado' });
    }

    try {
        const decodedToken = await authAdmin.verifySessionCookie(userToken, true);
        const userId = decodedToken.uid;
        const userRecord = await authAdmin.getUser(userId);

        const loginTime = new Date(decodedToken.auth_time * 1000);
        const logoutTime = new Date();
        const loggedInDuration = logoutTime - loginTime;

        await authAdmin.revokeRefreshTokens(userId);

        // Guardar logs no Firestore
        const logData = {
            userId: userId,
            email: userRecord.email,
            loginTime: loginTime.toISOString(),
            logoutTime: logoutTime.toISOString(),
            loggedInDuration: loggedInDuration,
            success: true,
            timestamp: new Date().toISOString()
        };

        await firestoreAdmin.collection('signoutLogs').add(logData);

        res.clearCookie('session');
        res.clearCookie('loggedIn');
        res.status(200).json({ message: 'Usuário deslogado com sucesso' });
    } catch (error) {
        console.error('Erro ao deslogar usuário:', error);

        // Guardar logs de erro no Firestore
        const logData = {
            userId: null,
            email: null,
            loginTime: null,
            logoutTime: new Date().toISOString(),
            loggedInDuration: null,
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        await firestoreAdmin.collection('signoutLogs').add(logData);

        res.status(500).json({ error: 'Erro ao deslogar usuário' });
    }
}

module.exports = { signOutUser };