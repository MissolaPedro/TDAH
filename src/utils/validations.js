window.addEventListener('load', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const loginSuccess = urlParams.get('loginSuccess');
  if (loginSuccess) {
    document.getElementById('form-login').reset();
  }
});

window.addEventListener('beforeunload', () => {
  localStorage.removeItem('email');
  localStorage.removeItem('password');
  
  const formReset = document.getElementById('form-reset');
  if (formReset) {
    formReset.reset();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const formReset = document.getElementById('form-reset');
  if (formReset) {
    formReset.addEventListener('submit', () => {
      setTimeout(() => {
        formReset.reset();
      }, 0);
    });
  }

  // Adiciona lógica para resetar todos os formulários após o envio
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (event) => {
      if (!validateForm(form)) {
        event.preventDefault();
      } else {
        setTimeout(() => {
          form.reset();
        }, 0);
      }
    });
  });

  // Exemplo de uso das funções de validação
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      validateInput(input);
    });
  });
});

// Função para verificar se o campo não está vazio
function isNotEmpty(input) {
  return input.value.trim() !== '';
}

// Função para verificar se o valor do campo está dentro de um comprimento mínimo e máximo
function isWithinLength(input, minLength, maxLength) {
  const length = input.value.trim().length;
  return length >= minLength && length <= maxLength;
}

// Função para verificar se o valor do campo corresponde a um padrão regex
function matchesPattern(input, pattern) {
  return pattern.test(input.value.trim());
}

// Função para validar um único campo de entrada
function validateInput(input) {
  const snackbar = document.getElementById('snackbar');
  const errorMessageElement = snackbar.querySelector('p');
  errorMessageElement.textContent = '';

  if (!isNotEmpty(input)) {
    errorMessageElement.textContent = `${input.name} não pode estar vazio`;
    showSnackbar();
    return false;
  }

  if (input.name === 'registerpassword' || input.name === 'loginpassword') {
    if (!isWithinLength(input, 6, 100)) {
      errorMessageElement.textContent = `${input.name} deve ter pelo menos 6 caracteres`;
      showSnackbar();
      return false;
    }
  }

  if (input.type === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!matchesPattern(input, emailPattern)) {
      errorMessageElement.textContent = `${input.name} deve ser um email válido`;
      showSnackbar();
      return false;
    }
  }

  return true;
}

// Função para validar todos os campos de um formulário
function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach(input => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });
  return isValid;
}

// Função para exibir a snackbar
function showSnackbar() {
  const snackbar = document.getElementById('snackbar');
  snackbar.classList.add('bg-error-500', 'text-white', 'opacity-100');
  setTimeout(() => {
    snackbar.style.opacity = '0';
  }, 5000);
}