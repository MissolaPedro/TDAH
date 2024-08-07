async function checkAuthStatus() {
    try {
        const response = await fetch("/auth/status");
        if (!response.ok) {
            throw new Error('Erro na resposta da rede');
        }
        const data = await response.json();
        console.log(data.loggedIn ? "Usuário está logado." : "Usuário não está logado.");

        const containerNotLogged = document.getElementById('ContainerNotLogged');
        const containerLogged = document.getElementById('ContainerLogged');

        if (containerNotLogged && containerLogged) {
            containerNotLogged.style.display = data.loggedIn ? 'none' : 'inline-flex';
            containerLogged.style.display = data.loggedIn ? 'inline-flex' : 'none';
        } else {
            console.error('Elementos DOM não encontrados');
        }
    } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
    }
}

checkAuthStatus();