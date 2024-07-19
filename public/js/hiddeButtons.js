document.addEventListener('DOMContentLoaded', (event) => {
    const loggedIn = document.cookie.split('; ').find(row => row.startsWith('loggedIn='));
    console.log('loggedIn:', loggedIn); // Adicione este log para depuração
    if (loggedIn && loggedIn.split('=')[1] === 'true') {
        console.log('Usuário logado.'); // Confirmação de que entrou no bloco correto
        document.getElementById('ContainerNotLogged').style.display = 'none';
        document.getElementById('ContainerLogged').style.display = 'inline-flex';
    } else {
        console.log('Usuário não logado.');
        document.getElementById('ContainerNotLogged').style.display = 'inline-flex';
        document.getElementById('ContainerLogged').style.display = 'none';
    }
});