const { db, collection, addDoc } = require('../../../config/auth-firebase'); // Importa as funções necessárias

async function insertLog(logData, collectionName) {
    try {
        // console.log(`Tentando adicionar log na coleção: ${collectionName}`); // Log de depuração
        const docRef = await addDoc(collection(db, collectionName), logData);
        // console.log('Log escrito com ID: ', docRef.id);
    } catch (e) {
        // console.error('Erro ao adicionar log: ', e);
    }
}

module.exports = { insertLog };