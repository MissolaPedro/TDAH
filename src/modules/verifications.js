const dns = require("dns").promises;
const bcrypt = require('bcryptjs');
const owasp = require('owasp-password-strength-test');

const SALT_ROUNDS = 12; // Ajustado para um valor mais comum

async function validarEmailCompleto(email) {
  if (!email) return false;
  if (typeof email !== 'string') return false;
  if (!email.includes('@')) return false;

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) return false;
  if (email.includes(' ')) return false;

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) return false;

  if (email.startsWith('.') || email.endsWith('.')) return false;
  if (email.includes('..')) return false;
  if (partesEmail[1].split('.').length < 2) return false;

  const regexCaracteresInvalidos = /[!#$%^&*(),?":{}|<>]/;
  if (regexCaracteresInvalidos.test(email)) return false;
  if (email.length > 254) return false;

  const extensoesValidas = ['.com', '.net', '.org', '.edu', '.gov', '.mil', '.int'];
  const dominio = partesEmail[1];
  const extensaoDominio = dominio.substring(dominio.lastIndexOf('.'));
  if (!extensoesValidas.includes(extensaoDominio)) return false;

  const regexUnicodeInvalido = /[^\x00-\x7F]/;
  if (regexUnicodeInvalido.test(email)) return false;
  if (dominio.startsWith('-') || dominio.endsWith('-')) return false;

  const nomeUsuario = partesEmail[0];
  const regexCaracteresEspeciaisConsecutivos = /[!#$%&'*+/=?^_`{|}~.-]{2,}/;
  if (regexCaracteresEspeciaisConsecutivos.test(nomeUsuario)) return false;
  if (regexCaracteresEspeciaisConsecutivos.test(dominio)) return false;
  if (dominio.includes('..')) return false;

  try {
    await dns.lookup(dominio);
  } catch (error) {
    return false;
  }

  return true;
}

async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error('Erro ao gerar o hash da senha.');
  }
}

function validateLoginPassword(password) {
  if (!password) return false;
  if (password.length < 8) return false;
  return true;
}

function validateRegisterPassword(password, username = 'usuario', personalInfo = ['nome', 'sobrenome', 'dataNascimento']) {
  if (!password) return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  if (/\s/.test(password)) return false;
  if (/(\w)\1\1/.test(password)) return false;
  if (password.toLowerCase().includes(username.toLowerCase())) return false;

  const passwordStrength = owasp.test(password);
  if (!passwordStrength.strong) return false;
  if (/123456|abcdef|qwerty/.test(password)) return false;

  for (const info of personalInfo) {
    if (password.toLowerCase().includes(info.toLowerCase())) return false;
  }

  const dictionaryWords = ['password', 'senha', 'admin'];
  for (const word of dictionaryWords) {
    if (password.toLowerCase().includes(word.toLowerCase())) return false;
  }

  if (/\b(19|20)\d{2}\b/.test(password)) return false;
  if (/qwerty|asdf|zxcv/.test(password)) return false;
  if (/(\w{2,})\1/.test(password)) return false;

  for (const word of dictionaryWords) {
    if (new RegExp(word + '\\d+').test(password)) return false;
    if (new RegExp(word + '[!@#$%^&*(),.?":{}|<>]').test(password)) return false;
    if (new RegExp(word.charAt(0).toUpperCase() + word.slice(1)).test(password)) return false;
  }

  return true;
}
function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

module.exports = {
  validarEmailCompleto,
  validateLoginPassword,
  validateRegisterPassword,
  hashPassword,
  isNotEmpty
};