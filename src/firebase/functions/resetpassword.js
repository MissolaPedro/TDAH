require('dotenv').config();
const { authAdmin, firestoreAdmin } = require('../../../config/configsFirebase');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

async function resetUserPassword(email) {
  const startTime = Date.now();
  let log = {
    email,
    success: false,
    error: null,
    duration: 0,
    timestamp: new Date().toISOString()
  };

  try {
    // Verificar se o email é válido e se o usuário existe
    const user = await authAdmin.getUserByEmail(email);
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    // Gerar link de reset de senha
    const resetLink = await authAdmin.generatePasswordResetLink(email);

    // Enviar email com o link de reset de senha
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER,
            Name: 'Projeto TDAH Ajuda'
          },
          To: [
            {
              Email: email,
              Name: user.displayName || 'Usuário'
            }
          ],
          Subject: 'Reset de Senha',
          TextPart: `Clique no link para resetar sua senha: ${resetLink}`,
          HTMLPart: `<p>Clique no link para resetar sua senha: <a href="${resetLink}">${resetLink}</a></p>`
        }
      ]
    });

    await request;

    log.success = true;
  } catch (error) {
    log.error = error.message;
  } finally {
    log.duration = Date.now() - startTime;
    await firestoreAdmin.collection('resetPasswordLogs').add(log);
  }

  return log;
}

module.exports = { resetUserPassword };