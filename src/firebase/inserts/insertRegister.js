// insertRegister.js

const { db, collection, addDoc } = require('../../../config/auth-firebase'); // Importa as funções necessárias

async function insertUserData(name, surname, email) {
    try {
        const docRef = await addDoc(collection(db, 'users'), {
            name: name,
            surname: surname,
            email: email
        });
        // console.log('Documento escrito com ID: ', docRef.id);
    } catch (e) {
        // console.error('Erro ao adicionar documento: ', e);
    }
}

module.exports = { insertUserData };