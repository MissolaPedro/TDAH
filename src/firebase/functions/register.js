require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env
const { authAdmin, firestoreAdmin } = require('../../../config/configsFirebase');
const mailjet = require('node-mailjet').connect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
const { validarEmail, validarSenha } = require('../../modules/verifications');
const crypto = require('crypto');

async function createUser({ email, password, displayName, surname }) {
  const startTime = Date.now();
  const log = {
    email,
    displayName,
    surname,
    createdAt: new Date().toISOString(),
    validationErrors: [],
    success: false,
    duration: 0,
  };

  try {
    // Validações
    const emailValidationResult = await validarEmail(email);
    if (emailValidationResult !== "O email é válido.") {
      log.validationErrors.push(emailValidationResult);
      throw new Error(emailValidationResult);
    }

    const passwordValidationResult = validarSenha(password);
    if (passwordValidationResult !== "A senha é válida.") {
      log.validationErrors.push(passwordValidationResult);
      throw new Error(passwordValidationResult);
    }

    // Criar usuário no Firebase
    const userRecord = await authAdmin.createUser({
      email: email,
      password: password,
      displayName: `${displayName} ${surname}`,
    });

    log.success = true;
    console.log('Usuário criado com sucesso:', userRecord.uid);

    // Gerar código de verificação
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Armazenar código de verificação no Firestore
    await firestoreAdmin.collection('emailVerificationCodes').add({
      email: email,
      code: verificationCode,
      createdAt: new Date().toISOString(),
    });

    // Enviar código de verificação por e-mail
    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_USER,
            Name: "Equipe",
          },
          To: [
            {
              Email: email,
              Name: displayName,
            },
          ],
          Subject: "Código de Verificação de E-mail",
          TextPart: `Olá ${displayName},\n\nSeu código de verificação é: ${verificationCode}\n\nObrigado,\nEquipe`,
        },
      ],
    });

    // Enviar o email
    await request;
    console.log('Código de verificação enviado com sucesso para:', email);

    return { success: true, message: 'Usuário criado com sucesso. Verifique seu e-mail para completar o registro.' };
  } catch (error) {
    console.error('Erro ao criar usuário ou enviar email:', error);
    return { success: false, message: 'Erro ao criar usuário ou enviar email.' };
  } finally {
    log.duration = Date.now() - startTime;
    // Guardar log no Firestore
    await firestoreAdmin.collection('registrationLogs').add(log);
  }
}

async function verifyEmailCode(email, code) {
  try {
    // Procurar o código de verificação no Firestore
    const snapshot = await firestoreAdmin.collection('emailVerificationCodes')
      .where('email', '==', email)
      .where('code', '==', code)
      .get();

    if (snapshot.empty) {
      throw new Error('Código de verificação inválido.');
    }

    // Buscar UID do usuário com base no e-mail
    const userRecord = await authAdmin.getUserByEmail(email);

    // Código de verificação válido, marcar e-mail como verificado
    await authAdmin.updateUser(userRecord.uid, { emailVerified: true });
    console.log('Endereço de e-mail verificado com sucesso.');
  } catch (error) {
    console.error('Erro ao verificar código de e-mail:', error);
  }
}

module.exports = { createUser, verifyEmailCode };