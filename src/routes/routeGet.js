// routeGet.js
const { signOutUser } = require("../firebase/functions/signout.js");

function routeGet(app) {
    // Rota para iniciar o processo de autorização
    app.get("/", (req, res) => {
        const showContact = true;
        const showRegister = true;

        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
            csrfToken: req.csrfToken(),
        });
    });

    app.get("/auth/status", (req, res) => {
        const isLoggedIn = req.cookies.loggedIn;
        res.json({ loggedIn: !!isLoggedIn });
    });

    app.get("/login", (req, res) => {
        res.render("forms/login", {
            title: "Login",
            csrfToken: req.csrfToken(),
            loginErrorMessage: null,
            loginSucessMessage: null,
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("forms/reset", {
            title: "Resetar a senha",
            csrfToken: req.csrfToken(),
            resetSucessMessage: null,
            resetErrorMessage: null
        });
    });

    app.get("/register", (req, res) => {
        res.render("forms/register", {
            title: "Registre-se",
            csrfToken: req.csrfToken(),
            registerErrorMessage: null,
            registerSucessMessage: null,
        });
    });

    app.get("/logout", (req, res) => {
        signOutUser(error => {
            if (!error) {
                res.clearCookie("loggedIn");
                res.redirect("/login");
            } else {
                res.redirect("/");
            }
        });
    });

    app.get("/error", (req, res) => {
        res.render("error", {
            title: "Erro",
            error: req.query.error,
        });
    });

    app.get("/contact", (req, res) => {
        res.render("Contact", {
            title: "Contato",
            csrfToken: req.csrfToken(),
            contactErrorMessage: null,
            contactSucessMessage: null,
        });
    });
}

module.exports = routeGet;
