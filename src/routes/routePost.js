const { validateLoginForm, validarEmail, validarSenha, isNotEmpty } = require('../modules/verifications');
const loginUser = require('../firebase/functions/login');
const { createUser, verifyEmailCode } = require('../firebase/functions/register'); // Adicione verifyEmailCode aqui
const { resetUserPassword } = require('../firebase/functions/resetpassword');

function routeEJS(app) {
    app.post("/login", validateLoginMiddleware, handleLogin);
    app.post("/register", validateRegisterMiddleware, handleRegister);
    app.post("/resetpassword", validateResetPasswordMiddleware, handleResetPassword);
    app.post("/contact", validateContactMiddleware, handleContact);
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

        res.cookie("loggedIn", true, {
            maxAge: 900000,
            httpOnly: true,
        });
        res.cookie("session", result.sessionCookie, {
            maxAge: loginrememberMe === "true" ? 60 * 60 * 24 * 30 * 1000 : 60 * 60 * 24 * 5 * 1000,
            httpOnly: true,
        });
        res.redirect("/dashboard");
    } catch (error) {
        console.error("Erro ao fazer login", error);
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
        console.log("Registrando usuário...");
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
        console.error("Erro ao registrar usuário:", error);
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
                resetErrorMessage: "Email inválido."
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
                resetErrorMessage: "Ocorreu um erro ao resetar a senha. Tente novamente."
            });
        }
    }
}

async function validateContactMiddleware(req, res, next) {
    const { name, email, message } = req.body;

    if (!isNotEmpty(name)) {
        return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const emailValidationResult = await validarEmail(email);
    if (emailValidationResult !== "O email é válido.") {
        return res.status(400).json({ error: emailValidationResult });
    }

    if (!isNotEmpty(message)) {
        return res.status(400).json({ error: "Mensagem é obrigatória" });
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

    try {
        await verifyEmailCode(email, code);
        res.send(`
            <script>
                alert('Seu e-mail foi verificado com sucesso. Você será redirecionado para a página de login.');
                window.location.href = '/login';
            </script>
        `);
    } catch (error) {
        console.error("Erro ao verificar e-mail:", error);
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

module.exports = routeEJS;