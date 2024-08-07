const { 
  registrarUsuario, 
  signInUser, 
  sendPasswordResetEmailFirebase, 
  signOutUser 
} = require("../firebase/functions/login");

const { 
  isNotEmpty, 
  validarEmailCompleto, 
  validateLoginPassword, 
  validateRegisterPassword 
} = require("../modules/verifications");

function routeEJS(app) {
  app.post('/login', async (req, res) => {
    const { loginemail, loginpassword, loginrememberMe } = req.body;
    let errorMessage = '';

    // console.log("Dados recebidos para login:", { loginemail, loginpassword, loginrememberMe });

    const emailValidationResult = await validarEmailCompleto(loginemail);
    if (emailValidationResult !== "O email é válido.") {
      errorMessage = emailValidationResult;
      return res.render('partials/form-login', { title: 'Login', errorMessage, csrfToken: req.csrfToken() });
    }

    const passwordErrors = validateLoginPassword(loginpassword);
    if (passwordErrors.length > 0) {
      errorMessage = passwordErrors.join(', ');
      return res.render('partials/form-login', { title: 'Login', errorMessage, csrfToken: req.csrfToken() });
    }

    signInUser(loginemail, loginpassword, loginrememberMe === "true", req, (error, user) => {
      if (error) {
        console.error("Erro ao fazer login:", error);
        return res.status(400).json({ error: error.message });
      }
      res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
      res.redirect('/dashboard');
    });
  });

  app.post("/register", async (req, res) => {
    const { registername, registersurname, registeremail, registerpassword, registerconfirmpassword } = req.body;
    let errorMessage = '';

    if (!isNotEmpty(registername)) {
      errorMessage = "Nome é obrigatório";
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }

    if (!isNotEmpty(registersurname)) {
      errorMessage = "Sobrenome é obrigatório";
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }

    const emailValidationResult = await validarEmailCompleto(registeremail);
    if (emailValidationResult !== "O email é válido.") {
      errorMessage = emailValidationResult;
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }

    const passwordErrors = validateRegisterPassword(registerpassword);
    if (passwordErrors.length > 0) {
      errorMessage = passwordErrors.join(', ');
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }

    if (registerconfirmpassword !== registerpassword) {
      errorMessage = "Confirmação de senha não corresponde à senha";
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }

    registrarUsuario(registeremail, registerpassword, (error, user) => {
      if (error) {
        errorMessage = "Falha no registro. Tente novamente.";
        return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
      }
      console.log("Usuário registrado com sucesso");
      res.cookie("loggedIn", true, { maxAge: 900000, httpOnly: true });
      res.redirect("/?registerSuccess=true");
    });
  });

  app.post("/logout", (req, res) => {
    signOutUser(error => {
      if (error) {
        console.error("Erro ao deslogar:", error);
        res.redirect("/");
      } else {
        console.log("Usuário deslogado com sucesso");
        res.clearCookie("loggedIn");
        res.redirect("/home");
      }
    });
  });

  app.post("/resetpassword", async (req, res) => {
    const { email } = req.body;

    const emailValidationResult = await validarEmailCompleto(email);
    if (emailValidationResult !== "O email é válido.") {
      return res.status(400).json({ error: emailValidationResult });
    }

    sendPasswordResetEmailFirebase(email, (error, message) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).json({ message: "Email de redefinição de senha enviado com sucesso." });
    });
  });

  app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!isNotEmpty(name)) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const emailValidationResult = await validarEmailCompleto(email);
    if (emailValidationResult !== "O email é válido.") {
      return res.status(400).json({ error: emailValidationResult });
    }

    if (!isNotEmpty(message)) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    res.status(200).json({ message: "Contato recebido com sucesso" });
  });
}

module.exports = routeEJS;