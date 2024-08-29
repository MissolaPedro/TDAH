require("dotenv").config(); // Carregar variáveis de ambiente do arquivo .env
const { authAdmin, firestoreAdmin } = require("../../../../config/configsFirebase");
const { createAndSendVerificationCode } = require("../createVerificationCode");
const { validarEmail, validarSenha } = require("../../../modules/verifications");
const { format } = require("date-fns");
const { ptBR } = require("date-fns/locale");

async function createUser({
    email = "",
    password = "",
    displayName = "",
    surname = "",
    phone = "",
    gender = "",
    photo = ""
}) {
    const startTime = Date.now();
    const log = {
        email,
        displayName,
        surname,
        createdAt: format(
            new Date(),
            "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
            { locale: ptBR }
        ),
        validationErrors: [],
        success: false,
        duration: 0,
    };

    let userRecord;

    try {
        // Validações
        const emailValidationResult = await validarEmail(email);
        if (emailValidationResult !== "O email é válido.") {
            log.validationErrors.push(emailValidationResult);
            throw new Error(emailValidationResult);
        }

        const passwordValidationResult = validarSenha(password);
        if (passwordValidationResult !== "A senha é válida.") {
            log.validationErrors.push(passwordValidationResult);
            throw new Error(passwordValidationResult);
        }

        // Verificar se o email já está em uso
        const userExists = await authAdmin.getUserByEmail(email).catch(() => null);
        if (userExists) {
            throw new Error("O email já está em uso.");
        }

        // Criar usuário no Firebase
        userRecord = await authAdmin.createUser({
            email: email,
            password: password,
            displayName: `${displayName} ${surname}`,
        });

        log.success = true;

        // Armazenar dados do usuário no Firestore
        const userProfileRef = firestoreAdmin
            .collection("Users")
            .doc("profiles")
            .collection(`user-${userRecord.uid}`)
            .doc("profile");
        await userProfileRef.set({
            email: email,
            telefone: phone,
            nome: displayName,
            sobrenome: surname,
            UID: userRecord.uid,
            genero: gender,
            foto: photo,
            createdAt: log.createdAt,
        });

        // Chamar a função para criar e enviar o código de verificação
        await createAndSendVerificationCode(email, displayName, userRecord, firestoreAdmin);

    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        log.validationErrors.push(error.message);
    } finally {
        log.duration = Date.now() - startTime;
        await saveLog(log, userRecord);
    }
    return log.success;
}
async function saveLog(log, userRecord) {
    const logData = {
        email: log.email,
        displayName: log.displayName,
        surname: log.surname,
        createdAt: log.createdAt,
        validationErrors: log.validationErrors,
        success: log.success,
        duration: log.duration,
    };

    if (userRecord && userRecord.uid) {
        logData.UID = userRecord.uid;
        await firestoreAdmin.collection("Users").doc("logs").collection(`user-${userRecord.uid}`).add(logData);
    } else {
        await firestoreAdmin.collection("Users").doc("logs").add(logData);
    }
}

module.exports = { createUser };