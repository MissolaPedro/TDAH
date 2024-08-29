const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { firestoreAdmin } = require('../../../config/configsFirebase'); // Certifique-se de que o caminho está correto

/**
 * Função para obter as áreas de conhecimento e suas matérias do Firestore.
 * @returns {Promise<Object>} Um objeto contendo as áreas de conhecimento e suas matérias.
 */
async function getAreasDeConhecimentoEMaterias() {
    try {
        const areasDeConhecimentoRef = firestoreAdmin.collection('AreasDeConhecimento');
        const snapshot = await areasDeConhecimentoRef.get();

        if (snapshot.empty) {
            console.log('Nenhuma área de conhecimento encontrada.');
            return {};
        }

        const areasDeConhecimento = {};
        for (const doc of snapshot.docs) {
            const materiasRef = areasDeConhecimentoRef.doc(doc.id).listCollections();
            const materiasSnapshot = await materiasRef;
            const materias = {};

            for (const materia of materiasSnapshot) {
                const materiaDocs = await materia.get();
                materias[materia.id] = materiaDocs.data().materias;
            }

            areasDeConhecimento[doc.id] = materias;
        }

        return areasDeConhecimento;
    } catch (error) {
        console.error('Erro ao obter áreas de conhecimento:', error);
        throw new Error('Erro ao obter áreas de conhecimento');
    }
}

module.exports = { getAreasDeConhecimentoEMaterias };