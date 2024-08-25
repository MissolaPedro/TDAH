const { firestoreAdmin, auth } = require('../../../config/configsFirebase');

async function signOutUser(req, res) {
    const userToken = req.cookies.session;
    if (!userToken) {
        return res.status(400).json({ error: 'Usuário não está logado' });
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            return res.status(400).json({ error: 'Usuário não está logado' });
        }

        const userId = user.uid;
        const userRecord = await user.getIdTokenResult();

        const loginTime = new Date(userRecord.authTime * 1000);
        const logoutTime = new Date();
        const loggedInDuration = logoutTime - loginTime;

        await auth.signOut();

        // Guardar logs no Firestore
        const logData = {
            userId: userId,
            email: user.email,
            loginTime: loginTime.toISOString(),
            logoutTime: logoutTime.toISOString(),
            loggedInDuration: loggedInDuration,
            success: true,
            timestamp: new Date().toISOString()
        };

        await firestoreAdmin.collection('signoutLogs').add(logData);

        if (!res.headersSent) {
            res.clearCookie('session');
            res.clearCookie('loggedIn');
            res.status(200).json({ message: 'Usuário deslogado com sucesso' });
        }
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

        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro ao deslogar usuário' });
        }
    }
}

module.exports = { signOutUser };