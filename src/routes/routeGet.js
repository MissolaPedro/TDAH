// routeGet.js

const { signOutUser } = require("../firebase/functions/signout.js");
const csrf = require('csurf'); // Middleware para CSRF
const csrfProtection = csrf({ cookie: true });

function routeGet(app) {
    app.get("/", csrfProtection, (req, res) => {
        const showContact = true; // Altere para false se não quiser mostrar o botão de contato
        const showRegister = true; // Altere para false se não quiser mostrar o botão de registro

        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
            welcomeMenssage: "Bem-vindo ao Projeto TDAH",
            description: "lorem ipsum",
            showContact,
            showRegister,
            csrfToken: req.csrfToken() // Inclui o token CSRF
        });
    });

    app.get("/auth/status", (req, res) => {
        try {
            const isLoggedIn = req.cookies.loggedIn;
            res.json({ loggedIn: !!isLoggedIn });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.get("/login", csrfProtection, (req, res) => {
        res.render("partials/form-login", {
            title: "Login",
            errorMessage: null,
            successMessage: null,
            csrfToken: req.csrfToken() // Inclui o token CSRF
        });
    });

    app.get("/resetpassword", csrfProtection, (req, res) => {
        res.render("partials/form-reset", {
            title: "Resetar a senha",
            errorMessage: null,
            successMessage: null,
            csrfToken: req.csrfToken() // Inclui o token CSRF
        });
    });

    app.get("/register", csrfProtection, (req, res) => {
        res.render("partials/form-register", {
            title: "Registre-se",
            errorMessage: null,
            csrfToken: req.csrfToken() // Inclui o token CSRF
        });
    });

    app.get("/contact", csrfProtection, (req, res) => {
        const showContact = false; // Altere para false se não quiser mostrar o botão de contato
        const showRegister = false; // Altere para false se não quiser mostrar o botão de registro

        res.render("contact", {
            title: "Contato",
            errorMessage: null,
            welcomeMenssage: null,
            description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
            showContact,
            showRegister,
            csrfToken: req.csrfToken() // Inclui o token CSRF
        });
    });

    app.get("/logout", (req, res) => {
        signOutUser(error => {
            if (error) {
                console.error("Erro ao deslogar:", error);
                res.redirect("/");
            } else {
                console.log("Usuário deslogado com sucesso");
                res.clearCookie("loggedIn");
                res.redirect("/login");
            }
        });
    });
}

module.exports = routeGet;