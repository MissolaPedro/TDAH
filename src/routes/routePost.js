const admin = require("firebase-admin");
const express = require("express");
const loginUser = require("../firebase/functions/auth/login");
const { resetUserPassword } = require("../firebase/functions/auth/resetPassword");
const { firestoreAdmin } = require("../../config/configsFirebase");
const securityMiddleware = require("../middlewares/security");
const { insertContactAndLog } = require("../firebase/inserts/insertContact");
const { inserttask } = require("../firebase/inserts/insertTasks");
const { taskconfig } = require("../modules/taskConfigs");
const { getVerificationCode } = require("../firebase/functions/getVerificationCode");

const { validateLoginForm, validarEmail, validarSenha, isNotEmpty } = require("../modules/verifications");
const { createUser } = require("../firebase/functions/auth/register");

const router = express.Router();

// Middleware de segurança
router.use(securityMiddleware);

// Definição das rotas com seus respectivos middlewares e manipuladores
router.post("/login", validateLoginMiddleware, handleLogin);
router.post("/register", validateRegisterMiddleware, handleRegister);
router.post("/resetpassword", validateResetPasswordMiddleware, handleResetPassword);
router.post("/contact", validateContactMiddleware, handleContact);
router.post("/verify-email", handleVerifyEmail);
router.post("/insertTasks", handleInsertTask);
router.post("/taskRequest", taskconfig);

// Funções de middleware e manipuladores de rota
function validateLoginMiddleware(req, res, next) {
    const { loginemail, loginpassword } = req.body;
    validateLoginForm({ email: loginemail, password: loginpassword }, (err, result) => {
        if (err || !result.isValid) {
            return res.render("forms/login", {
                title: "Login",
                loginErrorMessage: result.errors.join(", "),
            });
        }
        next();
    });
}

function handleLogin(req, res) {
    const { loginemail, loginpassword, loginrememberMe } = req.body;

    loginUser(loginemail, loginpassword, loginrememberMe === "true", (err, result) => {
        if (err || !result.success) {
            return res.render("forms/login", {
                title: "Login",
                loginErrorMessage: "Informações Inválidas",
            });
        }

        const logsRef = firestoreAdmin.collection("loginLogs");
        logsRef
            .where("email", "==", loginemail)
            .where("success", "==", true)
            .orderBy("timestamp", "desc")
            .limit(1)
            .get()
            .then(logSnapshot => {
                if (logSnapshot.empty) {
                    throw new Error("Token de sessão não encontrado.");
                }

                const logData = logSnapshot.docs[0].data();
                const sessionCookie = logData.sessionCookie;

                res.cookie("loggedIn", true, {
                    maxAge: loginrememberMe === "true" ? 60 * 60 * 24 * 30 * 1000 : 60 * 60 * 24 * 5 * 1000,
                    httpOnly: true,
                });
                res.cookie("session", sessionCookie, {
                    maxAge: loginrememberMe === "true" ? 60 * 60 * 24 * 30 * 1000 : 60 * 60 * 24 * 5 * 1000,
                    httpOnly: true,
                });
                res.redirect("/agenda");
            })
            .catch(error => {
                res.render("forms/login", {
                    title: "Login",
                    loginErrorMessage: "Informações Inválidas",
                });
            });
    });
}

function validateRegisterMiddleware(req, res, next) {
    const { registername, registersurname, registeremail, registerpassword, registerconfirmpassword, termos } = req.body;

    if (!isNotEmpty(registername)) {
        return renderRegisterError(res, "O nome não pode estar vazio.");
    }

    if (!isNotEmpty(registersurname)) {
        return renderRegisterError(res, "O sobrenome não pode estar vazio.");
    }

    validarEmail(registeremail, (err, emailValidationResult) => {
        if (emailValidationResult !== "O email é válido.") {
            return renderRegisterError(res, emailValidationResult);
        }

        const passwordErrors = validarSenha(registerpassword);
        if (passwordErrors !== "A senha é válida.") {
            return renderRegisterError(res, passwordErrors);
        }

        if (registerconfirmpassword !== registerpassword) {
            return renderRegisterError(res, "As senhas não coincidem.");
        }

        if (!termos) {
            return renderRegisterError(res, "Você deve aceitar os termos de uso.");
        }

        next();
    });
}

function handleRegister(req, res) {
    const { registername, registersurname, registeremail, registerpassword } = req.body;

    createUser({ email: registeremail, password: registerpassword, displayName: registername, surname: registersurname }, (err) => {
        if (err) {
            return res.render("forms/register", {
                title: "Registre-se",
                registerErrorMessage: "Erro ao registrar usuário. Tente novamente.",
            });
        }

        res.redirect(`/verify-email?email=${encodeURIComponent(registeremail)}`);
    });
}

function validateResetPasswordMiddleware(req, res, next) {
    const { email } = req.body;

    validarEmail(email, (err, emailValidationResult) => {
        if (emailValidationResult !== "O email é válido.") {
            return res.render("forms/reset", {
                title: "Resetar senha",
                resetErrorMessage: "Email inválido.",
                resetSuccessMessage: null,
            });
        }

        next();
    });
}

function handleResetPassword(req, res) {
    const { email } = req.body;

    resetUserPassword(email, (err, log) => {
        if (err || !log.success) {
            return res.render("forms/reset", {
                title: "Resetar senha",
                resetErrorMessage: "Ocorreu um erro ao resetar a senha. Tente novamente.",
                resetSuccessMessage: null,
            });
        }

        res.status(200).json({ resetErrorMessage: null });
    });
}

function validateContactMiddleware(req, res, next) {
    const { name, surname, email, message, categoria } = req.body;

    if (!name || !surname || !email || !message || !categoria) {
        return res.render("Contact", {
            title: "Contato",
            contactErrorMessage: "Todos os campos são obrigatórios",
            contactSuccessMessage: null,
        });
    }

    validarEmail(email, (err, emailValidationResult) => {
        if (emailValidationResult !== "O email é válido.") {
            return res.render("Contact", {
                title: "Contato",
                contactErrorMessage: emailValidationResult,
                contactSuccessMessage: null,
            });
        }

        if (!isNotEmpty(message)) {
            return res.render("Contact", {
                title: "Contato",
                contactErrorMessage: "Mensagem é obrigatória",
                contactSuccessMessage: null,
            });
        }

        next();
    });
}

function handleContact(req, res) {
    const { name, surname, email, message, categoria } = req.body;

    const contactData = {
        name,
        surname,
        email,
        message,
        category: categoria,
    };

    insertContactAndLog(contactData)
        .then(() => {
            res.render("Contact", {
                title: "Contato",
                contactErrorMessage: null,
                contactSuccessMessage: "Sua mensagem foi enviada com sucesso!",
            });
        })
        .catch(error => {
            console.error('Erro ao lidar com o formulário de contato:', error);
            res.render("Contact", {
                title: "Contato",
                contactErrorMessage: "Erro ao enviar a mensagem. Tente novamente.",
                contactSuccessMessage: null,
            });
        });
}

function handleVerifyEmail(req, res) {
    const { email, code } = req.body;

    if (!Array.isArray(code)) {
        return res.render("forms/verify-email", {
            title: "Verificação de E-mail",
            message: "Código de verificação inválido.",
            email: email,
        });
    }

    const verificationCode = code.join(""); // Concatenar os valores dos inputs

    verifyEmailCode(email, verificationCode, (err) => {
        if (err) {
            return res.render("forms/verify-email", {
                title: "Verificação de E-mail",
                message: "Erro ao verificar e-mail. Por favor, tente novamente.",
                email: email,
            });
        }

        res.redirect("/login");
    });
}

function renderRegisterError(res, message) {
    res.render("forms/register", {
        title: "Registre-se",
        registerErrorMessage: message,
    });
}

function handleInsertTask(req, res) {
    const { nome, sobrenome, materia, horarioInicio, horarioTermino, tempoEstimado, periodo } = req.body;

    const idToken = req.headers.authorization.split("Bearer ")[1];
    admin.auth().verifyIdToken(idToken, (err, decodedToken) => {
        if (err) {
            return res.status(500).json({ taskErrorMessage: "Erro ao inserir tarefa. Tente novamente." });
        }

        const UID = decodedToken.uid;

        inserttask({ UID, nome, sobrenome, materia, horarioInicio, horarioTermino, tempoEstimado, periodo }, (err) => {
            if (err) {
                return res.status(500).json({ taskErrorMessage: "Erro ao inserir tarefa. Tente novamente." });
            }

            res.status(200).json({ taskSuccessMessage: "Tarefa inserida com sucesso!" });
        });
    });
}

function verifyEmailCode(email, code, callback) {
    firestoreAdmin
        .collection("Users")
        .where("email", "==", email)
        .get()
        .then(userRef => {
            if (userRef.empty) {
                return callback(new Error("Usuário não encontrado."));
            }

            const userDoc = userRef.docs[0];
            const uid = userDoc.id;

            getVerificationCode(uid, (err, storedCode) => {
                if (err || storedCode !== code) {
                    return callback(new Error("Código de verificação inválido."));
                }

                callback(null);
            });
        })
        .catch(callback);
}

module.exports = router;