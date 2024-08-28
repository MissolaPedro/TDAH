const { firestoreAdmin } = require('./configsFirebase');

// Função para calcular a semana do ano
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

async function inserirTarefa(data) {
    const { UID, nome, sobrenome, materia, horarioInicio, horarioTermino, tempoEstimado, periodo } = data;
    const [ano, numeroSemana] = getWeekNumber(new Date());
    const semanaId = `semana-${numeroSemana}-${ano}`;
    const usuarioId = `usuario-${UID}`;

    try {
        const db = firestoreAdmin;

        // Referência para a coleção de tarefas
        const tasksRef = db.collection('tasks');

        // Referência para a subcoleção da semana
        const semanaRef = tasksRef.doc(semanaId);

        // Atualizar os contadores de tarefas na coleção da semana
        await db.runTransaction(async (transaction) => {
            const semanaDoc = await transaction.get(semanaRef);
            if (!semanaDoc.exists) {
                transaction.set(semanaRef, {
                    totalTarefas: 1,
                    tarefasNaoRealizadas: 1,
                    tarefasRealizadas: 0
                });
            } else {
                const data = semanaDoc.data();
                transaction.update(semanaRef, {
                    totalTarefas: data.totalTarefas + 1,
                    tarefasNaoRealizadas: data.tarefasNaoRealizadas + 1
                });
            }
        });

        // Referência para a coleção do usuário
        const usuarioRef = tasksRef.doc(usuarioId);

        // Atualizar os dados do usuário
        await db.runTransaction(async (transaction) => {
            const usuarioDoc = await transaction.get(usuarioRef);
            if (!usuarioDoc.exists) {
                transaction.set(usuarioRef, {
                    nome: nome,
                    sobrenome: sobrenome,
                    UID: UID,
                    qtdTarefasRegistradas: 1
                });
            } else {
                const data = usuarioDoc.data();
                transaction.update(usuarioRef, {
                    qtdTarefasRegistradas: data.qtdTarefasRegistradas + 1
                });
            }
        });

        // Referência para a subcoleção de tarefas do usuário
        const tarefaRef = usuarioRef.collection('Tarefa');

        // Inserir a nova tarefa
        await tarefaRef.add({
            materia: materia,
            horarioInicio: horarioInicio,
            horarioTermino: horarioTermino,
            tempoEstimado: tempoEstimado,
            periodo: periodo
        });

        console.log('Tarefa inserida com sucesso!');
    } catch (error) {
        console.error('Erro ao inserir tarefa:', error);
        throw new Error('Erro ao inserir tarefa');
    }
}

module.exports = { inserirTarefa };