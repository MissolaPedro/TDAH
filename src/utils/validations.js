    // Passo 1: Limpar campos após o login com sucesso
    window.addEventListener('load', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const loginSuccess = urlParams.get('loginSuccess');
        if (loginSuccess) {
          document.getElementById('form-login').reset();
        }
      });
    
      // Passo 2: Resetar valores ao sair da página de login
      window.addEventListener('beforeunload', () => {
        localStorage.removeItem('email'); // Corrigido para remover 'email'
        localStorage.removeItem('password'); // Corrigido para remover 'password'
      });