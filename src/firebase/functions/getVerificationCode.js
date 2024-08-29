const { firestoreAdmin } = require("../../../config/configsFirebase");

async function getVerificationCode(uid) {
    if (!uid) {
        throw new Error("UID inválido.");
    }

    try {
        const userRegisterLogsRef = firestoreAdmin
            .collection("Users")
            .doc("logs")
            .collection(`user-${uid}`)
            .orderBy("createdAt", "desc")
            .limit(1);

        const snapshot = await userRegisterLogsRef.get();
        if (snapshot.empty) {
            throw new Error("Código de verificação não encontrado.");
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        if (!data.verificationCode) {
            throw new Error("Código de verificação não encontrado.");
        }

        return data.verificationCode;
    } catch (error) {
        console.error("Erro ao obter código de verificação:", error);
        throw new Error("Erro ao obter código de verificação.");
    }
}

module.exports = { getVerificationCode };