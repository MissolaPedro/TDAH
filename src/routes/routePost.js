const {
    signInUser,
} = require("../firebase/functions/login"); // Importar funções de login

const {
    sendPasswordResetEmailFirebase,
} = require("../firebase/functions/resetpassword"); // Importar funções de reset de senha

const {
    signOutUser,
} = require("../firebase/functions/signout"); // Importar funções de logout

const {
    registrarUsuario,
} = require("../firebase/functions/register"); // Importar funções de registro

const {
    validateLoginForm,
    validarEmailCompleto,
    validateRegisterPassword,
    isNotEmpty
} = require('../modules/verifications');

const { insertUserData } = require('../firebase/inserts/insertRegister');

// Importar módulo de logging
const logging = require('../middlewares/logging');

function routeEJS(app) {
    // Carregar middleware de logging
    logging(app);

    app.post("/login", async (req, res) => {
        const { loginemail, loginpassword, loginrememberMe } = req.body;
    
        // Validação do formulário de login
        const { isValid, errors } = await validateLoginForm({ loginemail, loginpassword });
    
        if (!isValid) {
            return res.render("forms/login", {
                title: "Login",
                csrfToken: req.csrfToken(),
                loginErrorMessage: errors.join(', ')
            });
        }
    
        try {
            await signInUser(loginemail, loginpassword, loginrememberMe === "true", req);
            res.cookie("loggedIn", true, {
                maxAge: 900000,
                httpOnly: true,
            });
            res.redirect("/dashboard");
        } catch (error) {
            console.error("Erro ao fazer login", error);
            return res.render("forms/login", {
                title: "Login",
                csrfToken: req.csrfToken(),
                loginErrorMessage: 'Informações Invalidas'
            });
        }
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
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: "O nome não pode estar vazio."
            });
        }
    
        // Verificação do sobrenome
        if (!isNotEmpty(registersurname)) {
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: "O sobrenome não pode estar vazio."
            });
        }
    
        // Validação do email
        const emailValidationResult = await validarEmailCompleto(registeremail);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: emailValidationResult
            });
        }
    
        // Validação da senha
        const passwordErrors = validateRegisterPassword(registerpassword);
        if (passwordErrors.length > 0) {
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: passwordErrors.join(", ")
            });
        }
    
        // Verificação da confirmação da senha
        if (registerconfirmpassword !== registerpassword) {
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: "As senhas não coincidem."
            });
        }
    
        // Verificação dos termos de uso
        if (!termos) {
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: "Você deve aceitar os termos de uso."
            });
        }
    
        try {
            await registrarUsuario(registeremail, registerpassword, req);
            await insertUserData(registername, registersurname, registeremail);
            res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
            res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: null
            });
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            return res.render("forms/register", {
                title: "Registre-se",
                csrfToken: req.csrfToken(),
                registerErrorMessage: "Erro ao registrar usuário. Tente novamente."
            });
        }
    });
    
    app.post("/logout", async (req, res) => {
        try {
            await signOutUser(req, res);
        } catch (error) {
            console.error("Erro ao deslogar:", error);
            return res.redirect("/");
        }
    });

    app.post("/resetpassword", async (req, res) => {
        const { email } = req.body;

        const emailValidationResult = await validarEmailCompleto(email);
        if (emailValidationResult !== "O email é válido.") {
            return res.render("forms/reset", {
                title: "Resetar senha",
                csrfToken: req.csrfToken(),
                resetErrorMessage: "Email inválido."
            });
        }

        try {
            await sendPasswordResetEmailFirebase(email, req);
            res.status(200).json({
                resetErrorMessage: null
            });
        } catch (error) {
            return res.render("forms/reset", {
                title: "Resetar senha",
                csrfToken: req.csrfToken(),
                resetErrorMessage: "Ocorreu um erro ao reseta a senha. Tente novamente."
            });
        }
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