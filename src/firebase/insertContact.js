const { firestoreAdmin } = require('../../config/configsFirebase');
const admin = require('firebase-admin');

// Função para inserir dados do formulário de contato e armazenar logs
async function insertContactAndLog(contactData) {
    try {
        const contactRef = firestoreAdmin.collection('contacts').doc();
        await contactRef.set(contactData);
        //console.log('Contato inserido:', contactData);

        const logRef = firestoreAdmin.collection('contactLogs').doc();
        await logRef.set({
            ...contactData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        //console.log('Log armazenado:', contactData);
    } catch (error) {
        //console.error('Erro ao inserir contato e armazenar log:', error);
    }
}

// Função para lidar com a inserção e log dos dados do formulário de contato
async function handleContactForm(req, res) {
    const { name, email, message, category } = req.body;

    const contactData = {
        name,
        email,
        message,
        category,
    };

    // Inserir dados do contato e armazenar log no Firestore
    await insertContactAndLog(contactData);

    //console.log('Processo de inserção de contato concluído.');
}

module.exports = { handleContactForm };