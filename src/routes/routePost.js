const {
    registrarUsuario,
    signInUser,
    sendPasswordResetEmailFirebase,
    signOutUser,
} = require("../firebase/functions/login");

const {
    validarEmailSimples,
    validarSenhaSimples,
    validateLoginForm,
    validarEmailCompleto,
    validateRegisterPassword,
    isNotEmpty
} = require('../modules/verifications');

function routeEJS(app) {
    app.post("/login", async (req, res) => {
        const { loginemail, loginpassword, loginrememberMe } = req.body;
    
        // Validação do formulário de login
        const { isValid, errors } = await validateLoginForm({ loginemail, loginpassword });
    
        if (!isValid) {
            return res.render("partials/form-login", {
                title: "Login",
                csrfToken: req.csrfToken(),
                loginErrorMessage: errors.join(', '),
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
                    console.error("Erro ao fazer login",);
                    return res.render("partials/form-login", {
                        title: "Login",
                        csrfToken: req.csrfToken(),
                        loginErrorMessage: 'Informações Invalidas',
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
    
        // Verificação do nome
        if (!isNotEmpty(registername)) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: "O nome não pode estar vazio."
            });
        }
    
        // Verificação do sobrenome
        if (!isNotEmpty(registersurname)) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: "O sobrenome não pode estar vazio."
            });
        }
    
        // Validação do email
        const emailValidationResult = await validarEmailCompleto(registeremail);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: emailValidationResult
            });
        }
    
        // Validação da senha
        const passwordErrors = validateRegisterPassword(registerpassword);
        if (passwordErrors.length > 0) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: passwordErrors.join(", ")
            });
        }
    
        // Verificação da confirmação da senha
        if (registerconfirmpassword !== registerpassword) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: "As senhas não coincidem."
            });
        }
    
        // Verificação dos termos de uso
        if (!termos) {
            return res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerErrorMessage: "Você deve aceitar os termos de uso."
            });
        }
    
        // Registro do usuário
        registrarUsuario(registeremail, registerpassword, (error, user) => {
            if (error) {
                console.error("Erro ao registrar usuário:", error);
                return res.render("partials/form-register", {
                    title: "Registre-se",
                    csrfToken: req.csrfToken(),
                    styles: ['/css/styles.css'],
                    scripts: ['/js/tailmater.js'],
                    registerErrorMessage: "Erro ao registrar usuário. Tente novamente."
                });
            }
            console.log("Usuário registrado com sucesso");
            res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
            res.render("partials/form-register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                styles: ['/css/styles.css'],
                scripts: ['/js/tailmater.js'],
                registerSucessMessage: "Usuário registrado com sucesso"
            });
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