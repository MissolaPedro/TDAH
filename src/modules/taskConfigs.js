const { validarCampos, validarHorario, isHoraPermitida } = require('./verifications');
const { getAreasDeConhecimentoEMaterias } = require('../firebase/consultation/consultaMaterias');
const fetch = require('node-fetch'); // Certifique-se de ter o node-fetch instalado

// Função para calcular a semana do ano
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

// Função para verificar se uma matéria da mesma área já foi registrada no dia
async function isMateriaJaRegistrada(materia, data, UID) {
    try {
        const response = await fetch('/getTasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ UID: UID, data: data }) // Usar o UID real do usuário
        });

        const tasks = await response.json();

        const areasDeConhecimento = await getAreasDeConhecimentoEMaterias();
        const areaDaMateria = Object.keys(areasDeConhecimento).find(area => areasDeConhecimento[area].includes(materia));

        return tasks.some(task => {
            const areaDaTask = Object.keys(areasDeConhecimento).find(area => areasDeConhecimento[area].includes(task.materia));
            return areaDaTask === areaDaMateria;
        });
    } catch (error) {
        console.error('Erro ao verificar matéria registrada:', error);
        return false;
    }
}

async function handleTaskRequest(req, res) {
    const { periodo, horarioInicio, horarioTermino, materia, assunto } = req.body;

    // Verifica se todos os campos estão preenchidos
    if (!validarCampos(periodo, horarioInicio, horarioTermino, materia, assunto)) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if (!validarHorario(horarioInicio, horarioTermino)) {
        return res.status(400).json({ message: "Horário inválido." });
    }

    const horaInicioInt = parseInt(horarioInicio.split(':')[0]);
    const horaTerminoInt = parseInt(horarioTermino.split(':')[0]);

    if (!isHoraPermitida(horaInicioInt, horaTerminoInt, periodo)) {
        return res.status(400).json({ message: "Hora não permitida para o período selecionado." });
    }

    const [ano, numeroSemana] = getWeekNumber(new Date());
    const tempoEstimado = horaTerminoInt - horaInicioInt;

    const UID = req.headers.authorization.split("Bearer ")[1]; // Obter o UID do cabeçalho de autorização

    const data = {
        UID: UID, // Usar o UID real do usuário
        nome: 'Nome', // Substitua pelo nome real do usuário
        sobrenome: 'Sobrenome', // Substitua pelo sobrenome real do usuário
        materia: materia,
        horarioInicio: horarioInicio,
        horarioTermino: horarioTermino,
        tempoEstimado: tempoEstimado,
        periodo: periodo,
        ano: ano,
        numeroSemana: numeroSemana,
        assunto: assunto
    };

    const hoje = new Date().toISOString().split('T')[0];

    if (await isMateriaJaRegistrada(materia, hoje, UID)) {
        return res.status(400).json({ message: "Você já registrou uma matéria dessa área hoje." });
    }

    try {
        const response = await fetch('/insertTasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            return res.status(200).json({ message: result.taskSuccessMessage });
        } else {
            return res.status(500).json({ message: result.taskErrorMessage });
        }
    } catch (error) {
        console.error('Erro ao inserir tarefa:', error);
        return res.status(500).json({ message: "Erro ao inserir tarefa. Tente novamente." });
    }
}

module.exports = { handleTaskRequest };