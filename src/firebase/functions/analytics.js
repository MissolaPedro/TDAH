const { logCustomEvent } = require("../../config/auth-firebase");

// Função para capturar e logar erros
function logError(error) {
  logCustomEvent("error", { message: error.message, stack: error.stack });
}

// Função para logar informações do usuário após o login
function logUserInfo(user) {
  logCustomEvent("login_success", { userId: user.uid, email: user.email });
}

module.exports = { logError, logUserInfo };