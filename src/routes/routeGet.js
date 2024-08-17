const { signOutUser } = require("../firebase/functions/signout.js");
const {authorize, listEvents, generateAuthUrl} = require('../api/index.js');
const {google} = require('googleapis');
const crypto = require('crypto');
const { SCOPES } = require('../api/index.js'); // Importar SCOPES

function routeGet(app) {
    // Rota para iniciar o processo de autorização
    app.get("/", (req, res) => {
        const showContact = true;
        const showRegister = true;

        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
            welcomeMenssage: "Bem-vindo ao Projeto TDAH",
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquam, distinctio architecto accusantium cum enim ipsam quos vitae natus voluptate rem, corporis quidem laborum eveniet ex magnam debitis. Asperiores, in eum!",
            showContact,
            showRegister,
            csrfToken: req.csrfToken(),
        });
    });

    app.get("/auth/status", (req, res) => {
        const isLoggedIn = req.cookies.loggedIn;
        res.json({ loggedIn: !!isLoggedIn });
    });

    app.get("/login", (req, res) => {
        res.render("partials/form-login", {
            title: "Login",
            csrfToken: req.csrfToken(), // Certifique-se de que o token CSRF está sendo passado
            loginErrorMessage: null,
            loginSucessMessage: null,
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("partials/form-reset", {
            title: "Resetar a senha",
            csrfToken: req.csrfToken(),
            resetSucessMessage: null,
            resetErrorMessage: null
        });
    });

    app.get("/register", (req, res) => {
        res.render("partials/form-register", {
            title: "Registre-se", // Certifique-se de que esta linha está presente
            csrfToken: req.csrfToken(), // Certifique-se de que o token CSRF está sendo passado
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

}

module.exports = routeGet;