document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('savebutton');

    saveButton.addEventListener('click', function() {
        // Obtém os valores dos campos
        //const periodo = document.getElementById('periodo').value;
        const horarioInicio = document.getElementById('horacomeco').value;
        const horarioTermino = document.getElementById('horatermino').value;
        const assunto = document.getElementById('assunto').value;
        const descricao = document.getElementById('descricao').value;

        // Verifica se todos os campos estão preenchidos
        if (!periodo || !horarioInicio || !horarioTermino || !assunto || !descricao) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Prepara os dados a serem enviados para o servidor
        const data = {
            periodo: periodo,
            horarioInicio: horarioInicio,
            horarioTermino: horarioTermino,
            assunto: assunto,
            descricao: descricao
        };

        // Envia os dados para o servidor usando Fetch API
        fetch('/save-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Sucesso:', result);
            // Limpa os campos do formulário após o sucesso
            document.getElementById('taskform').reset();
        })
        .catch(error => {
            console.error('Erro:', error);
        });
    });
});
