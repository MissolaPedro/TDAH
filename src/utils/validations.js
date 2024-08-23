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
});

window.addEventListener('beforeunload', () => {
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
});