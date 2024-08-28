document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taskform'); // Adicionado para referenciar o formulário
    const periodoSelect = document.getElementById('periodo');
    const horaInicioInput = document.getElementById('horacomeco');
    const horaTerminoInput = document.getElementById('horatermino');
    const assuntoInput = document.getElementById('assunto');
    const descricaoInput = document.getElementById('descricao');
    const saveButton = document.getElementById('savebutton');

        // Adiciona evento de mudança para o seletor de período
        periodoSelect.addEventListener('change', function() {
            // Limpa os campos de hora quando o período é alterado
            horaInicioInput.value = '';
            horaTerminoInput.value = '';
        });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const periodo = periodoSelect.value;
        const horarioInicio = horaInicioInput.value;
        const horarioTermino = horaTerminoInput.value;
        const assunto = assuntoInput.value;
        const descricao = descricaoInput.value;

        // Verifica se todos os campos estão preenchidos
        if (!periodo || !horarioInicio || !horarioTermino || !assunto || !descricao) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if(horarioInicio > horarioTermino){
            alert('Horário inválido. A hora de inicio deve ser menor que a hora de término')
           return;
        }

        const horaInicioInt = parseInt(horarioInicio.split(':')[0]);
        const horaTerminoInt = parseInt(horarioTermino.split(':')[0]);

        if (isHoraPermitida(horaInicioInt, horaTerminoInt, periodo)) {
            // Prepara os dados a serem enviados para o servidor
            const data = {
                periodo: periodo,
                horarioInicio: horarioInicio,
                horarioTermino: horarioTermino,
                assunto: assunto,
                descricao: descricao
            };

            // Aqui você pode adicionar a lógica para enviar os dados para o servidor
            // Exemplo:
            // fetch('/caminho/para/api', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(data),
            // }).then(response => response.json())
            //   .then(data => console.log('Success:', data))
            //   .catch(error => console.error('Error:', error));

            alert('Tarefa salva com sucesso!');
            form.reset(); // Limpa o formulário após salvar
        } else {
            alert('Horário inválido para o período selecionado.');
        }
    });

    function isHoraPermitida(horaInicio, horaTermino, periodo) {
        switch (periodo) {
            case 'manhã':
                return horaInicio >= 8 && horaTermino <= 12; // Manhã: 6h às 12h
            case 'tarde':
                return horaInicio >= 14 && horaTermino <= 18; // Tarde: 12h às 18h
            case 'noite':
                return horaInicio >= 18 && horaTermino <= 22; // Noite: 18h às 22h
            default:
                return false;
        }
    }
});
