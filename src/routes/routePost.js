const { registrarUsuario } = require("../firebase/functions/register");
const { signInUser } = require("../firebase/functions/login");
const { sendPasswordResetEmailFirebase } = require("../firebase/functions/resetpassword");
const { isValidEmail, isValidDomain, isValidPassword } = require("../modules/verifications");

function routeEJS(app) {
  app.post("/login", async (req, res) => {
    const { loginemail, loginpassword, loginrememberMe } = req.body;

    if (!loginemail || !isValidEmail(loginemail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!loginpassword || !isValidPassword(loginpassword)) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    try {
      if (!await isValidDomain(loginemail)) {
        return res.status(400).json({ error: "Domínio de email inválido" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Erro ao verificar domínio de email" });
    }

    signInUser(loginemail, loginpassword, loginrememberMe === "true", req, (error, user) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).json({ user });
    });
  });

  app.post("/register", async (req, res) => {
    const { registeremail, registerpassword, registerconfirmpassword } = req.body;

    if (!registeremail || !isValidEmail(registeremail)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    try {
      if (!await isValidDomain(registeremail)) {
        return res.status(400).json({ error: "Domínio de email inválido" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Erro ao verificar domínio de email" });
    }

    if (!registerpassword || !isValidPassword(registerpassword)) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    if (registerconfirmpassword !== registerpassword) {
      return res.status(400).json({ error: "Confirmação de senha não corresponde à senha" });
    }

    registrarUsuario(registeremail, registerpassword, (error, user) => {
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(200).json({ user });
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
      res.status(200).json({ message });
    });
  });

  app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!message) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    res.status(200).json({ message: "Contato recebido com sucesso" });
  });
}

module.exports = routeEJS;