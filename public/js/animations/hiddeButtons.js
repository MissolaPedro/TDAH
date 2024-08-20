async function checkAuthStatus() {
    try {
        const response = await fetch("/auth/status");
        if (!response.ok) {
            throw new Error('Erro na resposta da rede');
        }
        const data = await response.json();
        console.log(data.loggedIn ? "Usuário está logado." : "Usuário não está logado.");

        updateDOMElements(data.loggedIn);
    } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
    }
}

function updateDOMElements(isLoggedIn) {
    const containerNotLogged = document.getElementById('containerNotLogged');
    const containerLogged = document.getElementById('containerLogged');

    if (containerNotLogged && containerLogged) {
        toggleVisibility(containerNotLogged, !isLoggedIn);
        toggleVisibility(containerLogged, isLoggedIn);
    } else {
        console.error('Elementos DOM não encontrados');
    }
}

function toggleVisibility(element, isVisible) {
    if (isVisible) {
        element.classList.remove('hidden');
        element.classList.add('flex');
    } else {
        element.classList.remove('flex');
        element.classList.add('hidden');
    }
}

// Chama a função para verificar o status de autenticação
checkAuthStatus();