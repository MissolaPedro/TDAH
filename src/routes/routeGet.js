const fs = require('fs');
const path = require('path');
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
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("forms/reset", {
            title: "Resetar a senha",
            csrfToken: req.csrfToken(),
            resetErrorMessage: null
        });
    });

    app.get("/register", (req, res) => {
        res.render("forms/register", {
            title: "Registre-se",
            csrfToken: req.csrfToken(),
            registerErrorMessage: null,
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
        });
    });

    app.get("/agenda", (req, res) => {
        res.render("user/agenda", {
            title: "Agenda",
        });
    });
}

module.exports = routeGet;