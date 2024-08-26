const { firestoreAdmin } = require('../../config/configsFirebase');
const admin = require('firebase-admin');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

// Função para inserir dados do formulário de contato e armazenar logs
async function insertContactAndLog(contactData) {
    try {
        // Removido: Inserção na coleção 'contacts'
        // const contactRef = firestoreAdmin.collection('contacts').doc();
        // await contactRef.set(contactData);

        const logRef = firestoreAdmin.collection('contact').doc();
        await logRef.set({
            ...contactData,
            timestamp: format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx", { locale: ptBR }),
        });
    } catch (error) {
        console.error('Erro ao inserir contato e armazenar log:', error);
    }
}

// Função para lidar com a inserção e log dos dados do formulário de contato
async function handleContactForm(req, res) {
    const { name, surname, email, message, categoria } = req.body;

    const contactData = {
        name,
        surname,
        email,
        message,
        category: categoria,
    };

    // Inserir dados do contato e armazenar log no Firestore
    await insertContactAndLog(contactData);

    // Renderizar a página de contato com uma mensagem de sucesso
    res.render("Contact", {
        title: "Contato",
        contactErrorMessage: null,
        contactSuccessMessage: "Sua mensagem foi enviada com sucesso!",
    });
}

module.exports = { handleContactForm };