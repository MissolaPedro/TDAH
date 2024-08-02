
function routeGet(app) {
    app.get("/", (req, res) => {
        const showContact = true; // Altere para false se não quiser mostrar o botão de contato
        const showRegister = true; // Altere para false se não quiser mostrar o botão de registro

        res.render("index", {
            title: "Projeto TDAH",
            query: req.query,
            welcomeMenssage: "Bem-vindo ao Projeto TDAH",
            description: "lorem ipsum",
            showContact,
            showRegister
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

    app.get("/login", (req, res) => {
        res.render("partials/form-login", {
            title: "Login",
            errorMessage: null,
            successMessage: null,
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("partials/form-reset", {
            title: "Resetar a senha",
            errorMessage: null,
            successMessage: null,
        });
    });

    app.get("/register", (req, res) => {
        res.render("partials/form-register", {
            title: "Registre-se",
            errorMessage: null,
        });
    });

    app.get("/contact", (req, res) => {
		const showContact = false; // Altere para false se não quiser mostrar o botão de contato
		const showRegister = false; // Altere para false se não quiser mostrar o botão de registro

        res.render("contact", {
            title: "Contato",
            errorMessage: null,
			welcomeMenssage: null,
            description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
            showContact,
            showRegister
        });
    });
}

module.exports = routeGet;
