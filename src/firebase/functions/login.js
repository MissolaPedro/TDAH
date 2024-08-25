const { authAdmin, firestoreAdmin } = require('../../../config/configsFirebase');
const { validarEmail, validarSenha } = require('../../modules/verifications');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

async function loginUser(email, password, rememberMe) {
  const startTime = Date.now();
  const logsRef = firestoreAdmin.collection('loginLogs');

  // Validar email e senha
  const emailValidationResult = await validarEmail(email);
  const passwordValidationResult = validarSenha(password);

  if (emailValidationResult !== "O email é válido." || passwordValidationResult !== "A senha é válida.") {
    await logsRef.add({
      email,
      success: false,
      message: 'Validação falhou',
      emailValidationResult,
      passwordValidationResult,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    throw new Error('Validação de email ou senha falhou');
  }

  try {
    // Autenticar usuário
    const userRecord = await authAdmin.getUserByEmail(email);
    const user = await authAdmin.verifyPassword(email, password);

    // Enviar email de confirmação usando Mailjet
    const request = mailjet.post("send", {'version': 'v3.1'}).request({
      "Messages":[
        {
          "From": {
            "Email": process.env.EMAIL_USER,
            "Name": "Seu Nome"
          },
          "To": [
            {
              "Email": email,
              "Name": "Usuário"
            }
          ],
          "Subject": "Confirmação de Login",
          "TextPart": "Você logou com sucesso no sistema.",
          "HTMLPart": "<h3>Você logou com sucesso no sistema.</h3>"
        }
      ]
    });

    await request;

    // Registrar sucesso do login no Firestore
    await logsRef.add({
      email,
      success: true,
      message: 'Login bem-sucedido',
      timestamp: new Date(),
      duration: Date.now() - startTime
    });

    // Configurar cookie de sessão
    const sessionCookie = await authAdmin.createSessionCookie(user.idToken, {
      expiresIn: rememberMe ? 60 * 60 * 24 * 30 * 1000 : 60 * 60 * 24 * 5 * 1000 // 30 dias ou 5 dias
    });

    return {
      success: true,
      sessionCookie
    };
  } catch (error) {
    // Registrar falha do login no Firestore
    await logsRef.add({
      email,
      success: false,
      message: 'Erro ao autenticar usuário',
      error: error.message,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    throw new Error('Erro ao autenticar usuário');
  }
}

module.exports = loginUser;