const { validateLoginForm, validarEmail, validarSenha, isNotEmpty } = require('../modules/verifications');
const loginUser = require('../firebase/functions/login');
const { createUser, verifyEmailCode } = require('../firebase/functions/register');
const { resetUserPassword } = require('../firebase/functions/resetpassword');
const { firestoreAdmin } = require('../../config/configsFirebase');
const securityMiddleware = require('../middlewares/security');
const { handleContactForm } = require('../firebase/insertContact');
//const {} = require('../js/task') 

function routeEJS(app) {
    securityMiddleware(app);
    app.post("/login", validateLoginMiddleware, handleLogin);
    app.post("/register", validateRegisterMiddleware, handleRegister);
    app.post("/resetpassword", validateResetPasswordMiddleware, handleResetPassword);
    app.post("/contact", validateContactMiddleware, handleContactForm);
    app.post("/verify-email", handleVerifyEmail);
}

async function validateLoginMiddleware(req, res, next) {
    const { loginemail, loginpassword } = req.body;
    const { isValid, errors } = await validateLoginForm({ email: loginemail, password: loginpassword });

    if (!isValid) {
        if (res && !res.headersSent) {
            return res.render("forms/login", {
                title: "Login",
                loginErrorMessage: errors.join(', '),
            });
        }
    }
    next();
}

async function handleLogin(req, res) {
    const { loginemail, loginpassword, loginrememberMe } = req.body;

    try {
        const result = await loginUser(loginemail, loginpassword, loginrememberMe === "true");

        const logsRef = firestoreAdmin.collection('loginLogs');
        const logSnapshot = await logsRef.where('email', '==', loginemail).where('success', '==', true).orderBy('timestamp', 'desc').limit(1).get();

        if (logSnapshot.empty) {
            throw new Error('Token de sessão não encontrado.');
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
    } catch (error) {
        if (res && !res.headersSent) {
            return res.render("forms/login", {
                title: "Login",
                loginErrorMessage: 'Informações Invalidas',
            });
        }
    }
}

async function validateRegisterMiddleware(req, res, next) {
    const {
        registername,
        registersurname,
        registeremail,
        registerpassword,
        registerconfirmpassword,
        termos,
    } = req.body;

    if (!isNotEmpty(registername)) {
        return renderRegisterError(res, "O nome não pode estar vazio.");
    }

    if (!isNotEmpty(registersurname)) {
        return renderRegisterError(res, "O sobrenome não pode estar vazio.");
    }

    const emailValidationResult = await validarEmail(registeremail);
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
}

async function handleRegister(req, res) {
    const {
        registername,
        registersurname,
        registeremail,
        registerpassword,
    } = req.body;

    try {
        await createUser({
            email: registeremail,
            password: registerpassword,
            displayName: registername,
            surname: registersurname
        });

        if (res && !res.headersSent) {
            res.redirect(`/verify-email?email=${encodeURIComponent(registeremail)}`);
        }
    } catch (error) {
        if (res && !res.headersSent) {
            return res.render("forms/register", {
                title: "Registre-se",
                registerErrorMessage: "Erro ao registrar usuário. Tente novamente."
            });
        }
    }
}

async function validateResetPasswordMiddleware(req, res, next) {
    const { email } = req.body;

    const emailValidationResult = await validarEmail(email);
    if (emailValidationResult !== "O email é válido.") {
        if (res && !res.headersSent) {
            return res.render("forms/reset", {
                title: "Resetar senha",
                resetErrorMessage: "Email inválido.",
                resetSuccessMessage: null
            });
        }
    }

    next();
}

async function handleResetPassword(req, res) {
    const { email } = req.body;

    try {
        const log = await resetUserPassword(email);
        if (log.success) {
            res.status(200).json({
                resetErrorMessage: null
            });
        } else {
            throw new Error(log.error);
        }
    } catch (error) {
        if (res && !res.headersSent) {
            return res.render("forms/reset", {
                title: "Resetar senha",
                resetErrorMessage: "Ocorreu um erro ao resetar a senha. Tente novamente.",
                resetSuccessMessage: null
            });
        }
    }
}

async function validateContactMiddleware(req, res, next) {
    const { name, surname, email, message, categoria } = req.body;

    if (!name || !surname || !email || !message || !categoria) {
        return res.render("Contact", {
            title: "Contato",
            contactErrorMessage: "Todos os campos são obrigatórios",
            contactSuccessMessage: null,
        });
    }

    const emailValidationResult = await validarEmail(email);
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
}

async function handleContact(req, res) {
    if (res && !res.headersSent) {
        res.status(200).json({ message: "Contato recebido com sucesso" });
    }
}

async function handleVerifyEmail(req, res) {
    const { email, code } = req.body;
    const verificationCode = code.join(''); // Concatenar os valores dos inputs

    try {
        await verifyEmailCode(email, verificationCode);
        res.redirect('/login');
    } catch (error) {
        res.render("forms/verify-email", {
            title: "Verificação de E-mail",
            message: "Erro ao verificar e-mail. Por favor, tente novamente.",
            email: email,
        });
    }
}

function renderRegisterError(res, message) {
    if (res && !res.headersSent) {
        return res.render("forms/register", {
            title: "Registre-se",
            registerErrorMessage: message
        });
    }
}

/*const saveTaskToFile = (taskData, callback) => {
    // Define o caminho para o arquivo JSON
    const filePath = path.join(__dirname, 'data', 'tasks.json');

    // Lê o arquivo existente
    fs.readFile(filePath, (err, data) => {
        if (err) return callback(err);
        
        let tasks = [];
        if (data.length) {
            tasks = JSON.parse(data);
            }

        // Adiciona a nova tarefa
        tasks.push(taskData);

        // Salva as tarefas no arquivo JSON
        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err) => {
            if (err) return callback(err);
            callback(null, { message: 'Tarefa salva com sucesso!' });
        });
    });
};

// Rota para salvar os dados
app.post('/task.json', (req, res) => {
    const taskData = req.body;

    // Usa a função saveTaskToFile para salvar a tarefa
    saveTaskToFile(taskData, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao salvar a tarefa!' });
        }
        res.json(result);
    });
}*/

module.exports = routeEJS;

