// routeGet.js

const { signOutUser } = require("../firebase/functions/signout.js");

function routeGet(app) {
    app.get("/", (req, res) => {
        try {
            const showContact = true;
            const showRegister = true;

            res.render("index", {
                title: "Projeto TDAH",
                query: req.query,
                welcomeMenssage: "Bem-vindo ao Projeto TDAH",
                description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquam, distinctio architecto accusantium cum enim ipsam quos vitae natus voluptate rem, corporis quidem laborum eveniet ex magnam debitis. Asperiores, in eum!",
                showContact,
                showRegister,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
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
        try {
            res.render("partials/form-login", {
                title: "Login",
                errorMessage: null,
                successMessage: null,
                csrfToken: req.csrfToken() // Certifique-se de que o token CSRF está sendo passado
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
    });

    app.get("/resetpassword", (req, res) => {
        try {
            res.render("partials/form-reset", {
                title: "Resetar a senha",
                errorMessage: null,
                successMessage: null,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
    });

    app.get("/register", (req, res) => {
        try {
            res.render("partials/form-register", {
                title: "Registre-se",
                errorMessage: null,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
    });

    app.get("/contact", (req, res) => {
        try {
            const showContact = false;
            const showRegister = false;

            res.render("contact", {
                title: "Contato",
                errorMessage: null,
                welcomeMenssage: null,
                description: "Caso tenha a necessidade de entrar em contato utilize do formulario abaixo",
                showContact,
                showRegister,
                csrfToken: req.csrfToken()
            });
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
    });

    app.get("/logout", (req, res) => {
        try {
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
        } catch (error) {
            console.error(error);
            res.status(500).render('error', {
                title: 'Erro Interno do Servidor',
                errorMessage: 'Algo deu errado!',
                errorDetails: process.env.NODE_ENV === 'development' ? error.stack : null,
            });
        }
    });
}

module.exports = routeGet;