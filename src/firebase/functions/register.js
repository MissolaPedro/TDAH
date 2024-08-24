const { auth, createUserWithEmailAndPassword } = require("../../../config/auth-firebase");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const mailjetTransport = require('nodemailer-mailjet-transport');

// Configure o transporte do Nodemailer com Mailjet
const transporter = nodemailer.createTransport(mailjetTransport({
    auth: {
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_API_SECRET,
    },
}));

async function registrarUsuario(registeremail, registerpassword, req, callback) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, registeremail, registerpassword);
        
        req.session.userId = userCredential.user.uid;

        const actionCodeSettings = {
            url: 'http://localhost:8080/verify-email?email=' + encodeURIComponent(registeremail),
            handleCodeInApp: true,
        };

        // Gera o link de verificação de e-mail
        const verificationLink = await admin.auth().generateEmailVerificationLink(registeremail, actionCodeSettings);

        // Envia o e-mail de verificação usando o serviço de e-mail configurado
        await sendVerificationEmail(registeremail, verificationLink);

        console.log('E-mail de verificação enviado.');

        if (callback && typeof callback === 'function') {
            callback(null, userCredential.user);
        }
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        if (callback && typeof callback === 'function') {
            callback(error, null);
        }
    }
}

// Função para enviar o e-mail de verificação
async function sendVerificationEmail(email, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // O e-mail que você configurou no Mailjet
        to: email,
        subject: 'Verificação de E-mail',
        text: `Clique no link para verificar seu e-mail: ${link}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de verificação enviado.');
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
    }
}

module.exports = { registrarUsuario };