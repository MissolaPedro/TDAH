const { registrarUsuario } = require("../firebase/functions/register");
const { signInUser } = require("../firebase/functions/login");
const { sendPasswordResetEmailFirebase } = require("../firebase/functions/resetpassword");
const { isValidEmail, isValidDomain, isValidPassword, isNotEmpty, isWithinLength, matchesPattern } = require("../modules/verifications");

function routeEJS(app) {
  app.post('/login', async (req, res) => {
    const { loginemail, loginpassword } = req.body;
  
    let errorMessage = '';
  
    // Validação do email
    if (!isValidEmail(loginemail)) {
      errorMessage = 'Email inválido';
      return res.render('form-login', { errorMessage, csrfToken: req.csrfToken() });
    }
  
    // Validação da senha
    if (!isValidPassword(loginpassword)) {
      errorMessage = 'Senha deve ter pelo menos 6 caracteres';
      return res.render('form-login', { errorMessage, csrfToken: req.csrfToken() });
    }
  
    signInUser(loginemail, loginpassword === "true", req, (error, user) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).json({ user });
    });
  
    res.redirect('/dashboard'); // Redirecionar após login bem-sucedido
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
  
    if (!registeremail || !isValidEmail(registeremail)) {
      errorMessage = "Email inválido";
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }
  
    try {
      if (!await isValidDomain(registeremail)) {
        errorMessage = "Domínio de email inválido";
        return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
      }
    } catch (error) {
      errorMessage = "Erro ao verificar domínio de email";
      return res.render("form-register", { errorMessage, csrfToken: req.csrfToken() });
    }
  
    if (!registerpassword || !isValidPassword(registerpassword)) {
      errorMessage = "Senha deve ter pelo menos 6 caracteres";
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

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    try {
      if (!await isValidDomain(email)) {
        return res.status(400).json({ error: "Domínio de email inválido" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Erro ao verificar domínio de email" });
    }

    sendPasswordResetEmailFirebase(email, (error, message) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).json({ message: "Email de redefinição de senha enviado com sucesso." });
    });
  });

  app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!isNotEmpty(name)) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!isNotEmpty(message)) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    res.status(200).json({ message: "Contato recebido com sucesso" });
  });
}

module.exports = routeEJS;