const {
    auth,
    firestoreAdmin,
    authAdmin,
} = require("../../../../config/configsFirebase");
const {
    validarEmail,
    validarSenha,
} = require("../../../modules/verifications");
const mailjet = require("node-mailjet").connect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);
const { signInWithEmailAndPassword } = require("firebase/auth");
const { format } = require("date-fns");
const { ptBR } = require("date-fns/locale");

async function loginUser(email, password, rememberMe) {
    const startTime = Date.now();

    // Validar email e senha
    const emailValidationResult = await validarEmail(email);
    const passwordValidationResult = validarSenha(password);

    if (
        emailValidationResult !== "O email é válido." ||
        passwordValidationResult !== "A senha é válida."
    ) {
        await firestoreAdmin.collection("Users").doc(email).collection("logs").add({
            email,
            success: false,
            message: "Validação falhou",
            emailValidationResult,
            passwordValidationResult,
            timestamp: format(
                new Date(),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
                { locale: ptBR }
            ),
            duration: Date.now() - startTime,
        });
        return { success: false };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        const idToken = await user.getIdToken();
        const sessionCookie = await authAdmin.createSessionCookie(idToken, {
            expiresIn: rememberMe
                ? 60 * 60 * 24 * 30 * 1000
                : 60 * 60 * 24 * 1000, // 30 dias ou 24 horas
        });

        // Atualizar o cookie de sessão no perfil do usuário
        const userProfileRef = firestoreAdmin
            .collection("Users")
            .doc("profiles")
            .collection(`user-${user.uid}`)
            .doc("profile");
        await userProfileRef.update({
            sessionCookie: sessionCookie,
        });

        await firestoreAdmin.collection("Users").doc(user.uid).collection("logs").add({
            UID: user.uid,
            email,
            success: true,
            message: "Login bem-sucedido",
            timestamp: format(
                new Date(),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
                { locale: ptBR }
            ),
            duration: Date.now() - startTime,
            sessionCookie,
        });

        // Enviar email de confirmação de login
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
                            Name: "Usuário",
                        },
                    ],
                    Subject: "Confirmação de Login",
                    TextPart: "Você logou com sucesso no sistema.",
                    HTMLPart: "<h3>Você logou com sucesso no sistema.</h3>",
                },
            ],
        });

        await request;

        return { success: true, sessionCookie };
    } catch (error) {
        await firestoreAdmin.collection("Users").doc(email).collection("logs").add({
            email,
            success: false,
            message: "Erro ao autenticar usuário",
            error: error.message,
            timestamp: format(
                new Date(),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss 'UTC'xxx",
                { locale: ptBR }
            ),
            duration: Date.now() - startTime,
        });
        return { success: false };
    }
}

module.exports = loginUser;