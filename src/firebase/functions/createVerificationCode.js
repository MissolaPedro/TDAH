const crypto = require("crypto");
const mailjet = require("node-mailjet").connect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);

async function createAndSendVerificationCode(email, displayName, userRecord, firestoreAdmin) {
    if (!email || !displayName || !userRecord || !firestoreAdmin) {
        throw new Error("Parâmetros inválidos.");
    }

    try {
        // Gerar código de verificação
        const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();

        // Armazenar código de verificação e logs no logs
        const userRegisterLogsRef = firestoreAdmin
            .collection("Users")
            .doc("logs")
            .collection(`user-${userRecord.uid}`)
            .doc(`log-${Date.now()}`); // Nome do documento mais específico
        await userRegisterLogsRef.set({
            UID: userRecord.uid,
            email: email,
            displayName: displayName,
            verificationCode: verificationCode,
            createdAt: new Date().toISOString(),
        });

        // Enviar código de verificação por e-mail
        const request = mailjet.post("send", { version: "v3.1" }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.EMAIL_USER,
                        Name: "Projeto TDAH",
                    },
                    To: [
                        {
                            Email: email,
                            Name: displayName,
                        },
                    ],
                    Subject: "Código de Verificação de E-mail",
                    TextPart: `Olá ${displayName},\n\nSeu código de verificação é: ${verificationCode}\n\nObrigado,\nEquipe`,
                },
            ],
        });

        // Enviar o email
        await request;
    } catch (error) {
        console.error("Erro ao criar e enviar código de verificação:", error);
        // Adicionar log de erro no Firestore
        const errorLogRef = firestoreAdmin.collection("Users").doc("errorLogs").collection(`user-${userRecord.uid}`).doc(`error-${Date.now()}`);
        await errorLogRef.set({
            UID: userRecord.uid,
            email: email,
            displayName: displayName,
            error: error.message,
            createdAt: new Date().toISOString(),
        });
    }
}

module.exports = { createAndSendVerificationCode };