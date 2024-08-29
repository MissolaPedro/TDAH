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
  // console.log("Iniciando validação de email:", email);
  if (!email) {
    // console.log(messages.email.empty);
    return messages.email.empty;
  }
  if (typeof email !== 'string') {
    // console.log(messages.email.invalidFormat);
    return messages.email.invalidFormat;
  }
  if (!email.includes('@')) {
    // console.log(messages.email.invalidFormat);
    return messages.email.invalidFormat;
  }

  const partesEmail = email.split('@');
  if (partesEmail.length !== 2 || !partesEmail[1].includes('.')) {
    // console.log(messages.email.invalidFormat);
    return messages.email.invalidFormat;
  }

  const regexEmailSimples = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmailSimples.test(email)) {
    // console.log(messages.email.invalidFormat);
    return messages.email.invalidFormat;
  }

  try {
    await dns.lookup(partesEmail[1]);
  } catch (error) {
    // console.log(messages.email.invalidDomain);
    return messages.email.invalidDomain;
  }

  // console.log(messages.email.valid);
  return messages.email.valid;
}

// Funções de validação de senha
function validarSenha(password) {
  // console.log("Iniciando validação de senha.");
  if (!password) {
    // console.log(messages.password.empty);
    return messages.password.empty;
  }
  const passwordStrength = owasp.test(password);
  if (!passwordStrength.strong) {
    // console.log(messages.password.weak);
    return messages.password.weak;
  }
  // console.log(messages.password.valid);
  return messages.password.valid;
}

// Funções de validação para registro
async function validateRegisterForm({ email, password }) {
  // console.log("Validando formulário de registro.");
  const emailValidationResult = await validarEmail(email);
  const passwordValidationResult = validarSenha(password);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }
  if (passwordValidationResult !== messages.password.valid) {
    errors.push(passwordValidationResult);
  }

  // console.log("Resultado da validação do formulário de registro:", {
  //   isValid: errors.length === 0,
  //   errors
  // });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funções de validação para login
async function validateLoginForm({ email, password }) {
  // console.log("Validando formulário de login.");
  const emailValidationResult = await validarEmail(email);
  const passwordValidationResult = validarSenha(password);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }
  if (passwordValidationResult !== messages.password.valid) {
    errors.push(passwordValidationResult);
  }

  // console.log("Resultado da validação do formulário de login:", {
  //   isValid: errors.length === 0,
  //   errors
  // });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Funções de validação para reset de senha
async function validateResetPasswordForm({ email }) {
  // console.log("Validando formulário de reset de senha.");
  const emailValidationResult = await validarEmail(email);

  const errors = [];
  if (emailValidationResult !== messages.email.valid) {
    errors.push(emailValidationResult);
  }

  // console.log("Resultado da validação do formulário de reset de senha:", {
  //   isValid: errors.length === 0,
  //   errors
  // });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Função para hash de senha
async function hashPassword(password) {
  // console.log("Gerando hash da senha.");
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("Hash da senha gerado com sucesso.");
    return hashedPassword;
  } catch (error) {
    // console.error("Erro ao gerar o hash da senha:", error);
    throw new Error('Erro ao gerar o hash da senha.');
  }
}

// Funções de validação para middleware
function isNotEmpty(value) {
  // console.log("Verificando se o valor não está vazio:", value);
  return value && value.trim().length > 0;
}

// Funções de validação de campos
function validarCampos(periodo, horarioInicio, horarioTermino, assunto, descricao) {
  // console.log("Validando campos:", { periodo, horarioInicio, horarioTermino, assunto, descricao });
  return periodo && horarioInicio && horarioTermino && assunto && descricao;
}

// Funções de validação de horário
function validarHorario(horarioInicio, horarioTermino) {
  // console.log("Validando horário:", { horarioInicio, horarioTermino });
  return horarioInicio < horarioTermino;
}

// Funções de validação de hora permitida
function isHoraPermitida(horaInicio, horaTermino, periodo) {
  // console.log("Verificando se a hora é permitida:", { horaInicio, horaTermino, periodo });
  const periodosPermitidos = {
    manhã: [6, 12],
    tarde: [12, 18],
    noite: [18, 24]
  };

  const [inicioPermitido, fimPermitido] = periodosPermitidos[periodo];
  return horaInicio >= inicioPermitido && horaTermino <= fimPermitido;
}

module.exports = {
  validateRegisterForm,
  validateLoginForm,
  validateResetPasswordForm,
  hashPassword,
  isNotEmpty,
  validarEmail,
  validarSenha,
  validarCampos,
  validarHorario,
  isHoraPermitida
};