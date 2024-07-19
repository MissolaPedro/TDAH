const { registrarUsuario } = require("../firebase/functions/register");
const { signInUser } = require("../firebase/functions/login");

function routeEJS(app) {
    app.get("/", (req, res) => {
        let successMessage = req.query.loginSuccess ? "Login realizado com sucesso!" : null;
        let registerSuccessMessage = req.query.registerSuccess ? "Registro realizado com sucesso!" : null;
        res.render("index", { title: "Projeto TDAH", query: req.query, successMessage: successMessage, registerSuccessMessage: registerSuccessMessage });
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

    app.get("/login", (req, res) => {
        res.render("partials/form-login", { title: "Login", errorMessage: null, successMessage: null });
    });

    app.get("/register", (req, res) => {
        res.render("partials/form-register", { errorMessage: null });
    });

    app.post("/login", (req, res) => {
        const { email, password } = req.body;
        signInUser(email, password, (error, user) => {
            if (error) {
                return res.render("partials/form-login", { title: "Login", errorMessage: "Falha no login. Verifique seu email e senha e tente novamente.", successMessage: null });
            }
            console.log("Usuário logado com sucesso");
            res.cookie('loggedIn', true, { maxAge: 900000, httpOnly: true });
            res.redirect("/?loginSuccess=true");
        });
    });

    app.post("/register", (req, res) => {
        const { email, password } = req.body;
        registrarUsuario(email, password, (error, user) => {
            if (error) {
                return res.render("partials/form-register", { errorMessage: "Falha no registro. Tente novamente." });
            }
            console.log("Usuário registrado com sucesso");
            res.cookie('loggedIn', true, { maxAge: 900000, httpOnly: true });
            res.redirect("/?registerSuccess=true");
        });
    });
}

module.exports = routeEJS;