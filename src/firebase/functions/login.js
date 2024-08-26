const { auth, firestoreAdmin, authAdmin } = require('../../../config/configsFirebase');
const { validarEmail, validarSenha } = require('../../modules/verifications');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
const { signInWithEmailAndPassword } = require('firebase/auth');

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
    ////console.log('Validação de email ou senha falhou');
    return;
  }

  try {
    //console.log('Iniciando autenticação do usuário...');
    // Autenticar usuário usando Firebase SDK Client
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    //console.log('Usuário autenticado:', user.uid);

    // Enviar email de confirmação usando Mailjet
    const request = mailjet.post("send", {'version': 'v3.1'}).request({
      "Messages":[
        {
          "From": {
            "Email": process.env.EMAIL_USER,
            "Name": "Projeto TDAH"
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
    //console.log('Email de confirmação enviado.');

    // Configurar cookie de sessão
    const idToken = await user.getIdToken();
    const sessionCookie = await authAdmin.createSessionCookie(idToken, {
      expiresIn: rememberMe ? 60 * 60 * 24 * 14 * 1000 : 60 * 5 * 1000 // 2 semanas ou 5 minutos
    });
    //console.log('Cookie de sessão criado:', sessionCookie);

    // Registrar sucesso do login no Firestore
    await logsRef.add({
      email,
      success: true,
      message: 'Login bem-sucedido',
      timestamp: new Date(),
      duration: Date.now() - startTime,
      sessionCookie // Armazenar o token de sessão
    });

    //console.log('Login bem-sucedido para:', email);
  } catch (error) {
    //console.error('Erro durante a autenticação:', error);
    // Registrar falha do login no Firestore
    await logsRef.add({
      email,
      success: false,
      message: 'Erro ao autenticar usuário',
      error: error.message,
      timestamp: new Date(),
      duration: Date.now() - startTime
    });
    //console.log('Erro ao autenticar usuário para:', email);
  }
}

module.exports = loginUser;