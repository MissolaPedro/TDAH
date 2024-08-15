// routeGet.js

const { signOutUser } = require("../firebase/functions/signout.js");

function routeGet(app) {
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
            styles: ['/css/styles.css'], // Adicione o caminho para o seu arquivo de estilos
            scripts: ['/js/tailmater.js'] // Adicione o caminho para o seu arquivo de scripts
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
            styles: ['/css/styles.css'], // Adicione o caminho para o seu arquivo de estilos
            scripts: ['/js/tailmater.js'] // Adicione o caminho para o seu arquivo de scripts
        });
    });

    app.get("/resetpassword", (req, res) => {
        res.render("partials/form-reset", {
            title: "Resetar a senha",
            csrfToken: req.csrfToken(),
            styles: ['/css/styles.css'], // Adicione o caminho para o seu arquivo de estilos
            scripts: ['/js/tailmater.js'] // Adicione o caminho para o seu arquivo de scripts
        });
    });

    app.get("/register", (req, res) => {
        res.render("partials/form-register", {
            title: "Registre-se", // Certifique-se de que esta linha está presente
            csrfToken: req.csrfToken(),
            styles: ['/css/styles.css'], // Adicione o caminho para o seu arquivo de estilos
            scripts: ['/js/tailmater.js'] // Adicione o caminho para o seu arquivo de scripts
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

    // Exemplo de um controlador em Node.js usando Express
    app.get('/layout', (req, res) => {
        const styles = [
            '/css/styles.css',
        ];
        res.render('layout', { styles: styles });
    });
}

module.exports = routeGet;