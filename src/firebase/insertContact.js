const { firestoreAdmin } = require('../../config/configsFirebase');

// Função para inserir dados do formulário de contato
async function insertContact(contactData) {
    try {
        const contactRef = firestoreAdmin.collection('contacts').doc();
        await contactRef.set(contactData);
        console.log('Dados do contato inseridos com sucesso:', contactData);
    } catch (error) {
        console.error('Erro ao inserir dados do contato:', error);
    }
}

// Função para armazenar logs dos formulários de contato
async function logContactForm(contactData) {
    try {
        const logRef = firestoreAdmin.collection('contactLogs').doc();
        await logRef.set({
            ...contactData,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Log do formulário de contato armazenado com sucesso:', contactData);
    } catch (error) {
        console.error('Erro ao armazenar log do formulário de contato:', error);
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

    // Inserir dados do contato no Firestore
    await insertContact(contactData);

    // Armazenar log do formulário de contato
    await logContactForm(contactData);

    res.status(200).json({ message: 'Contato recebido com sucesso' });
}

module.exports = { handleContactForm };