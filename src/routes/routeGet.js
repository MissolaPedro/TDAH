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
            csrfToken: req.csrfToken(),
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

    app.get('/events', async (req, res) => {
        try {
            // Autenticar e obter o cliente da API do Google
            const auth = await authorize();
            const calendar = google.calendar({ version: 'v3', auth });
            
            // Listar os próximos 10 eventos no calendário principal do usuário
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });

            const events = response.data.items;
            if (events.length) {
                res.json(events);
            } else {
                res.send('Nenhum evento encontrado.');
            }
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            res.status(500).send('Erro ao listar eventos.');
        }
    });
}

module.exports = routeGet;
