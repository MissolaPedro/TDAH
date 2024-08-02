fetch("/auth/status")
    .then(response => response.json())
    .then(data => {
        console.log(data.loggedIn ? "Usuário está logado." : "Usuário não está logado.");
        document.getElementById('ContainerNotLogged').style.display = data.loggedIn ? 'none' : 'inline-flex';
        document.getElementById('ContainerLogged').style.display = data.loggedIn ? 'inline-flex' : 'none';
    });

    