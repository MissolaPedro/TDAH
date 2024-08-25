const authMiddleware = require("../middlewares/auth.js");
const admin = require("firebase-admin");
const { signOutUser } = require("../firebase/functions/signout.js");
const { verifyEmailCode } = require("../firebase/functions/register.js"); // Ajuste o caminho conforme necessário

function routeGet(app) {
    // Rotas públicas
    app.get("/", (req, res) => {
        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
            // csrfToken: req.csrfToken(),
        });
    });

    app.get("/auth/status", (req, res) => {
        const isLoggedIn = req.cookies.loggedIn;
        res.json({ loggedIn: !!isLoggedIn });
    });

    app.get("/login", (req, res) => {
        res.render("forms/login", {
            title: "Login",
            // csrfToken: req.csrfToken(),
            loginErrorMessage: null,
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("forms/reset", {
            title: "Resetar a senha",
            // csrfToken: req.csrfToken(),
            resetErrorMessage: null,
        });
    });

    app.get("/register", (req, res) => {
        res.render("forms/register", {
            title: "Registre-se",
            // csrfToken: req.csrfToken(),
            registerErrorMessage: null,
        });
    });

    app.get("/logout", async (req, res, next) => {
        try {
            await signOutUser(req, res);
            res.clearCookie("loggedIn");
            res.redirect("/login");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
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
            // csrfToken: req.csrfToken(),
            contactErrorMessage: null,
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
            // csrfToken: req.csrfToken(),
        });
    });

    app.get("/agenda", authMiddleware, (req, res) => {
        res.render("user/agenda", {
            title: "Agenda",
            // csrfToken: req.csrfToken(),
        });
    });

    app.get("/task", authMiddleware, (req, res) => {
        res.render("user/task", {
            title: "Tarefas",
            // csrfToken: req.csrfToken(),
        });
    });

    app.get("/settings", authMiddleware, (req, res) => {
        res.render("user/settings", {
            title: "Configurações",
            // csrfToken: req.csrfToken(),
        });
    });
}

module.exports = routeGet;