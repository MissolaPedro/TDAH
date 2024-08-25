const dns = require("dns").promises;
const bcrypt = require('bcryptjs');
const owasp = require('owasp-password-strength-test');

const SALT_ROUNDS = 12;

// Sistema de mensagens personalizadas
const messages = {
  email: {
    empty: "Email não pode ser vazio.",
    invalidFormat: "Formato de email inválido.",
    invalidDomain: "Domínio do email não pôde ser encontrado.",
    valid: "O email é válido."
  },
  password: {
    empty: "Senha não pode ser vazia.",
    weak: "Senha não é forte o suficiente.",
    valid: "A senha é válida."
  }
};

// Funções de validação de email
async function validarEmail(email) {
  if (!email) return messages.email.empty;
  if (typeof email !== 'string') return messages.email.invalidFormat;
  if (!email.includes('@')) return messages.email.invalidFormat;

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) return messages.email.invalidFormat;

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) return messages.email.invalidFormat;

  try {
    await dns.lookup(partesEmail[1]);
  } catch (error) {
    return messages.email.invalidDomain;
  }

  return messages.email.valid;
}

// Funções de validação de senha
function validarSenha(password) {
  if (!password) return messages.password.empty;
  const passwordStrength = owasp.test(password);
  if (!passwordStrength.strong) return messages.password.weak;
  return messages.password.valid;
}

// Funções de validação para registro
async function validateRegisterForm({ email, password }) {
  const emailValidationResult = await validarEmail(email);
  const passwordValidationResult = validarSenha(password);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }
  if (passwordValidationResult !== messages.password.valid) {
    errors.push(passwordValidationResult);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funções de validação para login
async function validateLoginForm({ email, password }) {
  const emailValidationResult = await validarEmail(email);
  const passwordValidationResult = validarSenha(password);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }
  if (passwordValidationResult !== messages.password.valid) {
    errors.push(passwordValidationResult);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funções de validação para reset de senha
async function validateResetPasswordForm({ email }) {
  const emailValidationResult = await validarEmail(email);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para hash de senha
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Erro ao gerar o hash da senha.');
  }
}

// Funções de validação para middleware
function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

module.exports = {
  validateRegisterForm,
  validateLoginForm,
  validateResetPasswordForm,
  hashPassword,
  isNotEmpty,
  validarEmail,
  validarSenha
};