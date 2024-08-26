const authMiddleware = require("../middlewares/auth.js");
const admin = require("firebase-admin");
const { signOutUser } = require("../firebase/functions/signout.js");
const { verifyEmailCode } = require("../firebase/functions/register.js");
const securityMiddleware = require('../middlewares/security'); // Importar o middleware de segurança

function routeGet(app) {
    app.get("/", (req, res) => {
        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
        });
    });

    app.get("/auth/status", (req, res) => {
        const isLoggedIn = req.cookies.loggedIn;
        res.json({ loggedIn: !!isLoggedIn });
    });

    app.get("/login", (req, res) => {
        res.render("forms/login", {
            title: "Login",
            loginErrorMessage: null,
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("forms/reset", {
            title: "Resetar a senha",
            resetErrorMessage: null,
            resetSuccessMessage: null,
        });
    });

    app.get("/register", (req, res) => {
        res.render("forms/register", {
            title: "Registre-se",
            registerErrorMessage: null,
        });
    });

    app.get("/logout", async (req, res, next) => {
        try {
            await signOutUser(req, res);
            if (!res.headersSent) {
                res.clearCookie("loggedIn");
                res.clearCookie("session");
                res.redirect("/login");
            }
        } catch (error) {
            //console.error("Erro ao fazer logout:", error);
            if (!res.headersSent) {
                res.redirect("/");
            }
        }
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
            contactErrorMessage: null,
            contactSuccessMessage: null,
        });
    });

    app.get("/verify-email", (req, res) => {
        res.render("forms/verify-email", {
            title: "Verificação de E-mail",
            message: "Por favor, insira o código de verificação enviado para o seu e-mail.",
            email: req.query.email,
        });
    });

    // Rotas protegidas
    app.get("/dashboard", authMiddleware, (req, res) => {
        res.render("user/dashboard", {
            title: "Dashboard",
        });
    });

    app.get("/agenda", authMiddleware, (req, res) => {
        res.render("user/agenda", {
            title: "Agenda",
        });
    });

    app.get("/task", authMiddleware, (req, res) => {
        res.render("user/task", {
            title: "Tarefas",
        });
    });

    app.get("/settings", authMiddleware, (req, res) => {
        res.render("user/settings", {
            title: "Configurações",
        });
    });
}

module.exports = routeGet;