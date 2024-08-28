const { validarCampos, validarHorario, isHoraPermitida } = require('../modules/verifications');
const { renderRegisterError } = require('../routes/routepost');
const { buscarMaterias } = require('./consultaMaterias');

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taskform');
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

    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();

        const periodo = periodoSelect.value;
        const horarioInicio = horaInicioInput.value;
        const horarioTermino = horaTerminoInput.value;
        const assunto = assuntoInput.value;
        const descricao = descricaoInput.value;

        // Verifica se todos os campos estão preenchidos
        if (!validarCampos(periodo, horarioInicio, horarioTermino, assunto, descricao)) {
            return renderRegisterError(res, "Todos os campos são obrigatórios.");
        }

        if (!validarHorario(horarioInicio, horarioTermino)) {
            return renderRegisterError(res, "Horário inválido.");
        }

        const horaInicioInt = parseInt(horarioInicio.split(':')[0]);
        const horaTerminoInt = parseInt(horarioTermino.split(':')[0]);

        if (!isHoraPermitida(horaInicioInt, horaTerminoInt, periodo)) {
            return renderRegisterError(res, "Hora não permitida para o período selecionado.");
        }

        // Calcular a quantidade de horas disponíveis
        const horasDisponiveis = horaTerminoInt - horaInicioInt;

        // Determinar a quantidade de tarefas que podem ser agendadas
        let quantidadeTarefas = 0;
        if (horasDisponiveis >= 1 && horasDisponiveis <= 2) {
            quantidadeTarefas = 1;
        } else if (horasDisponiveis > 2 && horasDisponiveis <= 4) {
            quantidadeTarefas = 2;
        } else if (horasDisponiveis > 4 && horasDisponiveis <= 6) {
            quantidadeTarefas = 3;
        } else if (horasDisponiveis > 6) {
            quantidadeTarefas = 4;
        }

        try {
            // Buscar matérias do banco de dados
            const materias = await buscarMaterias();

            // Filtrar matérias por área
            const areas = new Set();
            const materiasFiltradas = materias.filter(materia => {
                if (!areas.has(materia.area)) {
                    areas.add(materia.area);
                    return true;
                }
                return false;
            });

            // Selecionar as matérias para agendamento
            const materiasParaAgendar = materiasFiltradas.slice(0, quantidadeTarefas);

            // Preparar os dados a serem enviados para o servidor
            const data = {
                periodo: periodo,
                horarioInicio: horarioInicio,
                horarioTermino: horarioTermino,
                assunto: assunto,
                descricao: descricao,
                tarefas: materiasParaAgendar
            };

            // Enviar os dados para o servidor
            await fetch('/insertTasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            form.reset(); // Limpa o formulário após salvar
            alert('Tarefas agendadas com sucesso!');
        } catch (error) {
            console.error('Erro ao buscar matérias:', error);
            return renderRegisterError(res, "Erro ao buscar matérias. Tente novamente.");
        }
    });
});