const dns = require("dns").promises;
const bcrypt = require('bcryptjs');
const owasp = require('owasp-password-strength-test');

const SALT_ROUNDS = 12; // Ajustado para um valor mais comum

async function validarEmailCompleto(email) {
  if (!email) return "O campo de email não pode estar vazio.";
  if (typeof email !== 'string') return "O campo de email deve ser uma string.";
  if (!email.includes('@')) return "O email deve conter um '@'.";

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) return "O email deve conter um domínio válido.";
  if (email.includes(' ')) return "O email não deve conter espaços em branco.";

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) return "O email não segue um formato válido.";

  if (email.startsWith('.') || email.endsWith('.')) return "O email não deve começar ou terminar com um ponto.";
  if (email.includes('..')) return "O email não deve conter dois pontos consecutivos.";
  if (partesEmail[1].split('.').length < 2) return "O domínio do email deve conter pelo menos um ponto.";

  const regexCaracteresInvalidos = /[!#$%^&*(),?":{}|<>]/;
  if (regexCaracteresInvalidos.test(email)) return "O email contém caracteres especiais inválidos.";
  if (email.length > 254) return "O email é muito longo.";

  const extensoesValidas = ['.com', '.net', '.org', '.edu', '.gov', '.mil', '.int'];
  const dominio = partesEmail[1];
  const extensaoDominio = dominio.substring(dominio.lastIndexOf('.'));
  if (!extensoesValidas.includes(extensaoDominio)) return "O domínio do email não tem uma extensão válida.";

  const regexUnicodeInvalido = /[^\x00-\x7F]/;
  if (regexUnicodeInvalido.test(email)) return "O email contém caracteres Unicode inválidos.";
  if (dominio.startsWith('-') || dominio.endsWith('-')) return "O domínio do email não deve começar ou terminar com um hífen.";

  const nomeUsuario = partesEmail[0];
  const regexCaracteresEspeciaisConsecutivos = /[!#$%&'*+/=?^_`{|}~.-]{2,}/;
  if (regexCaracteresEspeciaisConsecutivos.test(nomeUsuario)) return "O nome do usuário não deve conter caracteres especiais consecutivos.";
  if (regexCaracteresEspeciaisConsecutivos.test(dominio)) return "O domínio do email não deve conter caracteres especiais consecutivos.";
  if (dominio.includes('..')) return "O domínio do email não deve conter subdomínios inválidos.";

  try {
    await dns.lookup(dominio);
  } catch (error) {
    return "Domínio do email inválido.";
  }

  return "O email é válido.";
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
  const errors = [];

  if (!password) {
    errors.push('A senha não pode estar vazia.');
  }

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }

  return errors;
}

function validateRegisterPassword(password, username = 'usuario', personalInfo = ['nome', 'sobrenome', 'dataNascimento']) {
  const errors = [];

  if (!password) {
    errors.push('A senha não pode estar vazia.');
  }

  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número.');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial.');
  }
  if (/\s/.test(password)) {
    errors.push('A senha não deve conter espaços em branco.');
  }
  if (/(\w)\1\1/.test(password)) {
    errors.push('A senha não deve conter caracteres repetidos consecutivos.');
  }

  if (password.toLowerCase().includes(username.toLowerCase())) {
    errors.push('A senha não deve conter o nome do usuário.');
  }

  const passwordStrength = owasp.test(password);
  if (!passwordStrength.strong) {
    errors.push('A senha é muito fraca.');
  }

  if (/123456|abcdef|qwerty/.test(password)) {
    errors.push('A senha não deve ser uma sequência comum.');
  }

  personalInfo.forEach(info => {
    if (password.toLowerCase().includes(info.toLowerCase())) {
      errors.push('A senha não deve conter informações pessoais.');
    }
  });

  const dictionaryWords = ['password', 'senha', 'admin'];
  dictionaryWords.forEach(word => {
    if (password.toLowerCase().includes(word.toLowerCase())) {
      errors.push('A senha não deve ser uma palavra do dicionário.');
    }
  });

  if (/\b(19|20)\d{2}\b/.test(password)) {
    errors.push('A senha não deve ser uma data.');
  }

  if (/qwerty|asdf|zxcv/.test(password)) {
    errors.push('A senha não deve ser uma combinação de teclas adjacentes.');
  }

  if (/(\w{2,})\1/.test(password)) {
    errors.push('A senha não deve ser uma repetição de um padrão.');
  }

  dictionaryWords.forEach(word => {
    if (new RegExp(word + '\\d+').test(password)) {
      errors.push('A senha não deve ser uma combinação de palavras comuns.');
    }
  });

  dictionaryWords.forEach(word => {
    if (new RegExp(word + '[!@#$%^&*(),.?":{}|<>]').test(password)) {
      errors.push('A senha não deve ser uma combinação de palavras e caracteres especiais.');
    }
  });

  dictionaryWords.forEach(word => {
    if (new RegExp(word.charAt(0).toUpperCase() + word.slice(1)).test(password)) {
      errors.push('A senha não deve ser uma combinação de palavras e letras maiúsculas.');
    }
  });

  return errors;
}

module.exports = {
  validarEmailCompleto,
  validateLoginPassword,
  validateRegisterPassword,
  hashPassword
};