const authMiddleware = require("../middlewares/auth.js");
const { signOutUser } = require("../firebase/functions/auth/signout.js");
const { verifyEmailCode } = require("../firebase/functions/auth/register.js");
const securityMiddleware = require("../middlewares/security");

async function handleVerifyEmail(req, res) {
    const { email, code } = req.query;
    if (!Array.isArray(code)) {
        return res.render("forms/verify-email", {
            title: "Verificação de E-mail",
            message: "Código de verificação inválido.",
            email: email,
        });
    }
    const verificationCode = code.join(""); // Concatenar os valores dos inputs

    try {
        await verifyEmailCode(email, verificationCode);
        res.redirect("/login");
    } catch (error) {
        res.render("forms/verify-email", {
            title: "Verificação de E-mail",
            message: "Erro ao verificar e-mail. Por favor, tente novamente.",
            email: email,
        });
    }
}

function routeGet(app) {
    app.use(securityMiddleware); // Aplicar o middleware de segurança a todas as rotas

    // Rotas públicas
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

    app.get("/verify-email", async (req, res) => {
        const { email, code } = req.query;
        if (email && code) {
            await handleVerifyEmail(req, res);
        } else {
            res.render("forms/verify-email", {
                title: "Verificação de E-mail",
                message: "Por favor, insira o código de verificação enviado para o seu e-mail.",
                email: req.query.email,
            });
        }
    });

    // Rotas protegidas
    app.get("/agenda", authMiddleware, (req, res) => {
        res.render("user/agenda", {
            title: "Agenda",
        });
    });

    app.get("/task", authMiddleware, (req, res) => {
        res.render("user/task", {
            title: "Tarefas",
            taskSuccessMessage: null,
            taskErrorMessage: null,
        });
    });
}

module.exports = routeGet;