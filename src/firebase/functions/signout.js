const { firestoreAdmin, auth } = require('../../../config/configsFirebase');

async function signOutUser(req, res) {
    const user = auth.currentUser;
    if (!user) {
        //console.log('Nenhum usuário logado.');
        return;
    }

    try {
        //console.log('Iniciando processo de logout...');
        const userId = user.uid;

        // Obter informações do usuário
        const userRecord = user;

        if (!userRecord) {
            //console.log('Usuário não encontrado.');
            return;
        }

        if (!userRecord.metadata.creationTime || isNaN(new Date(userRecord.metadata.creationTime).getTime())) {
            throw new Error('Invalid creationTime value');
        }

        const loginTime = new Date(userRecord.metadata.creationTime);
        const logoutTime = new Date();
        const loggedInDuration = logoutTime - loginTime;

        await auth.signOut();
        //console.log('Usuário deslogado com sucesso.');

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
        //console.log('Log de logout salvo.');
    } catch (error) {
        //console.error('Erro ao deslogar usuário:', error);

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
        //console.log('Log de erro salvo.');
    }
}

module.exports = { signOutUser };