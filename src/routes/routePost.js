const {
    registrarUsuario,
    signInUser,
    sendPasswordResetEmailFirebase,
    signOutUser,
} = require("../firebase/functions/login");

const {
    isNotEmpty,
    validarEmailCompleto,
    validateLoginPassword,
    validateRegisterPassword,
} = require("../modules/verifications");

function routeEJS(app) {
    app.post("/login", async (req, res) => {
        const { loginemail, loginpassword, loginrememberMe } = req.body;

        // Validação do email
        const emailValidationResult = await validarEmailCompleto(loginemail);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("partials/form-login", {
                title: "Login",
                csrfToken: req.csrfToken(),
                loginErrorMessage: emailValidationResult,
                loginSucessMessage: null,
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        // Validação da senha
        const passwordErrors = validateLoginPassword(loginpassword);
        if (passwordErrors.length > 0) {
            return res.render("partials/form-login", {
                title: "Login",
                csrfToken: req.csrfToken(),
                loginErrorMessage: passwordErrors.join(', '),
                loginSucessMessage: null,
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        // Tentativa de login
        signInUser(
            loginemail,
            loginpassword,
            loginrememberMe === "true",
            req,
            (error, user) => {
                if (error) {
                    console.error("Erro ao fazer login:", error);
                    return res.render("partials/form-login", {
                        title: "Login",
                        csrfToken: req.csrfToken(),
                        loginErrorMessage: error.message,
                        loginSucessMessage: null,
                        styles: ['/css/styles.css'],
                        scripts: ['/js/tailmater.js']
                    });
                }
                res.cookie("loggedIn", true, {
                    maxAge: 900000,
                    httpOnly: true,
                });
                res.redirect("/dashboard");
            }
        );
    });

    app.post("/register", async (req, res) => {
        const {
            registername,
            registersurname,
            registeremail,
            registerpassword,
            registerconfirmpassword,
            termos,
        } = req.body;

        if (!isNotEmpty(registername)) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        if (!isNotEmpty(registersurname)) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        const emailValidationResult = await validarEmailCompleto(registeremail);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        const passwordErrors = validateRegisterPassword(registerpassword);
        if (passwordErrors.length > 0) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        if (registerconfirmpassword !== registerpassword) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        if (!termos) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        registrarUsuario(registeremail, registerpassword, (error, user) => {
            if (error) {
                console.error("Erro ao registrar usuário:", error);
                return res.render("partials/form-register", {
                    title: "Registre-se",
                    csrfToken: req.csrfToken(),
                    styles: ['/css/styles.css'],
                    scripts: ['/js/tailmater.js']
                });
            }
            console.log("Usuário registrado com sucesso");
            res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
            res.redirect("/?registerSuccess=true");
        });
    });

    app.post("/logout", (req, res) => {
        signOutUser(error => {
            if (error) {
                console.error("Erro ao deslogar:", error);
                res.redirect("/");
            } else {
                console.log("Usuário deslogado com sucesso");
                res.clearCookie("loggedIn");
                res.redirect("/home");
            }
        });
    });

    app.post("/resetpassword", async (req, res) => {
        const { email } = req.body;

        const emailValidationResult = await validarEmailCompleto(email);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("partials/form-reset", {
                title: "Resetar senha",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js']
            });
        }

        sendPasswordResetEmailFirebase(email, (error, message) => {
            if (error) {
                return res.render("partials/form-reset", {
                    title: "Resetar senha",
                    csrfToken: req.csrfToken(),
                    styles: ['/css/styles.css'],
                    scripts: ['/js/tailmater.js']
                });
            }
            res.status(200).json({
                message: "Email de redefinição de senha enviado com sucesso.",
            });
        });
    });

    app.post("/contact", async (req, res) => {
        const { name, email, message } = req.body;

        if (!isNotEmpty(name)) {
            return res.status(400).json({ error: "Nome é obrigatório" });
        }

        const emailValidationResult = await validarEmailCompleto(email);
        if (emailValidationResult !== "O email é válido.") {
            return res.status(400).json({ error: emailValidationResult });
        }

        if (!isNotEmpty(message)) {
            return res.status(400).json({ error: "Mensagem é obrigatória" });
        }

        res.status(200).json({ message: "Contato recebido com sucesso" });
    });
}

module.exports = routeEJS;