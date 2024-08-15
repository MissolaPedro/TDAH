const dns = require("dns").promises;
const bcrypt = require('bcryptjs');
const owasp = require('owasp-password-strength-test');

const SALT_ROUNDS = 12; // Ajustado para um valor mais comum

// Funções de validação completas para outros formulários
async function validarEmailCompleto(email) {
  if (!email) return "Email não pode ser vazio.";
  if (typeof email !== 'string') return "Email deve ser uma string.";
  if (!email.includes('@')) return "Email deve conter '@'.";

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) return "Email deve conter um domínio válido.";
  if (email.includes(' ')) return "Email não pode conter espaços.";

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) return "Formato de email inválido.";

  if (email.startsWith('.') || email.endsWith('.')) return "Email não pode começar ou terminar com '.'.";
  if (email.includes('..')) return "Email não pode conter '..'.";
  if (partesEmail[1].split('.').length < 2) return "Domínio do email inválido.";

  const regexCaracteresInvalidos = /[!#$%^&*(),?":{}|<>]/;
  if (regexCaracteresInvalidos.test(email)) return "Email contém caracteres inválidos.";
  if (email.length > 254) return "Email excede o comprimento máximo de 254 caracteres.";

  const extensoesValidas = ['.com', '.net', '.org', '.edu', '.gov', '.mil', '.int'];
  const dominio = partesEmail[1];
  const extensaoDominio = dominio.substring(dominio.lastIndexOf('.'));
  if (!extensoesValidas.includes(extensaoDominio)) return "Extensão de domínio inválida.";

  const regexUnicodeInvalido = /[^\x00-\x7F]/;
  if (regexUnicodeInvalido.test(email)) return "Email contém caracteres Unicode inválidos.";
  if (dominio.startsWith('-') || dominio.endsWith('-')) return "Domínio do email não pode começar ou terminar com '-'.";

  const nomeUsuario = partesEmail[0];
  const regexCaracteresEspeciaisConsecutivos = /[!#$%&'*+/=?^_`{|}~.-]{2,}/;
  if (regexCaracteresEspeciaisConsecutivos.test(nomeUsuario)) return "Nome de usuário contém caracteres especiais consecutivos.";
  if (regexCaracteresEspeciaisConsecutivos.test(dominio)) return "Domínio contém caracteres especiais consecutivos.";
  if (dominio.includes('..')) return "Domínio não pode conter '..'.";

  try {
    await dns.lookup(dominio);
  } catch (error) {
    return "Domínio do email não pôde ser encontrado.";
  }

  return "O email é válido.";
}

function validateRegisterPassword(password, username = 'usuario', personalInfo = ['nome', 'sobrenome', 'dataNascimento']) {
  const errors = [];
  if (!password) errors.push("Senha não pode ser vazia.");
  if (password.length < 8) errors.push("Senha deve ter pelo menos 8 caracteres.");
  if (!/[A-Z]/.test(password)) errors.push("Senha deve conter pelo menos uma letra maiúscula.");
  if (!/[a-z]/.test(password)) errors.push("Senha deve conter pelo menos uma letra minúscula.");
  if (!/[0-9]/.test(password)) errors.push("Senha deve conter pelo menos um número.");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("Senha deve conter pelo menos um caractere especial.");
  if (/\s/.test(password)) errors.push("Senha não pode conter espaços.");
  if (/(\w)\1\1/.test(password)) errors.push("Senha não pode conter caracteres repetidos consecutivamente.");
  if (password.toLowerCase().includes(username.toLowerCase())) errors.push("Senha não pode conter o nome de usuário.");

  const passwordStrength = owasp.test(password);
  if (!passwordStrength.strong) errors.push("Senha não é forte o suficiente.");
  if (/123456|abcdef|qwerty/.test(password)) errors.push("Senha não pode ser uma sequência comum.");

  for (const info of personalInfo) {
    if (password.toLowerCase().includes(info.toLowerCase())) errors.push("Senha não pode conter informações pessoais.");
  }

  const dictionaryWords = ['password', 'senha', 'admin'];
  for (const word of dictionaryWords) {
    if (password.toLowerCase().includes(word.toLowerCase())) errors.push("Senha não pode conter palavras comuns.");
  }

  if (/\b(19|20)\d{2}\b/.test(password)) errors.push("Senha não pode conter anos.");
  if (/qwerty|asdf|zxcv/.test(password)) errors.push("Senha não pode conter padrões de teclado.");
  if (/(\w{2,})\1/.test(password)) errors.push("Senha não pode conter padrões repetidos.");

  for (const word of dictionaryWords) {
    if (new RegExp(word + '\\d+').test(password)) errors.push("Senha não pode conter palavras comuns seguidas de números.");
    if (new RegExp(word + '[!@#$%^&*(),.?":{}|<>]').test(password)) errors.push("Senha não pode conter palavras comuns seguidas de caracteres especiais.");
    if (new RegExp(word.charAt(0).toUpperCase() + word.slice(1)).test(password)) errors.push("Senha não pode conter palavras comuns com a primeira letra maiúscula.");
  }

  return errors;
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

function isNotEmpty(value) {
  return value && value.trim().length > 0;
}

// Funções de validação simplificadas para o formulário de login
async function validarEmailSimples(email) {
  if (!email) return "Email não pode ser vazio.";
  if (typeof email !== 'string') return "Email deve ser uma string.";
  if (!email.includes('@')) return "Email deve conter '@'.";

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) return "Email deve conter um domínio válido.";

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) return "Formato de email inválido.";

  return "O email é válido.";
}

function validarSenhaSimples(password) {
  if (!password) return "Senha não pode ser vazia.";
  return "A senha é válida.";
}

async function validateLoginForm({ loginemail, loginpassword }) {
  const emailValidationResult = await validarEmailSimples(loginemail);
  const passwordValidationResult = validarSenhaSimples(loginpassword);

  const errors = [];
  if (emailValidationResult !== "O email é válido.") {
    errors.push(emailValidationResult);
  }
  if (passwordValidationResult !== "A senha é válida.") {
    errors.push(passwordValidationResult);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validarEmailCompleto,
  validateRegisterPassword,
  hashPassword,
  isNotEmpty,
  validarEmailSimples,
  validarSenhaSimples,
  validateLoginForm
};