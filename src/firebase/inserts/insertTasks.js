const { firestoreAdmin } = require("../../../config/configsFirebase");
const { buscarUsuarioLogado } = require("../functions/searchUser");

async function validarDados(data) {
    const requiredFields = [
        "UID",
        "materia",
        "horarioInicio",
        "horarioTermino",
        "tempoEstimado",
        "periodo",
        "ano",
        "numeroSemana",
        "assunto",
    ];
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`Campo obrigatório ausente: ${field}`);
        }
    }
}

async function atualizarContadoresSemana(db, semanaRef) {
    await db.runTransaction(async transaction => {
        const semanaDoc = await transaction.get(semanaRef);
        if (!semanaDoc.exists) {
            transaction.set(semanaRef, {
                totalTarefas: 1,
                tarefasNaoRealizadas: 1,
                tarefasRealizadas: 0,
            });
        } else {
            const data = semanaDoc.data();
            transaction.update(semanaRef, {
                totalTarefas: data.totalTarefas + 1,
                tarefasNaoRealizadas: data.tarefasNaoRealizadas + 1,
            });
        }
    });
}

async function atualizarDadosUsuario(db, usuarioRef) {
    await db.runTransaction(async transaction => {
        const usuarioDoc = await transaction.get(usuarioRef);
        if (!usuarioDoc.exists) {
            transaction.set(usuarioRef, {
                qtdTarefasRegistradas: 1,
            });
        } else {
            const data = usuarioDoc.data();
            transaction.update(usuarioRef, {
                qtdTarefasRegistradas: data.qtdTarefasRegistradas + 1,
            });
        }
    });
}

async function inserirTarefa(data) {
    try {
        await validarDados(data);

        const {
            UID,
            materia,
            horarioInicio,
            horarioTermino,
            tempoEstimado,
            periodo,
            ano,
            numeroSemana,
            assunto,
        } = data;
        const semanaId = `semana-${numeroSemana}-${ano}`;
        const usuarioId = `usuario-${UID}`;

        const db = firestoreAdmin;

        // Obter informações do usuário logado
        const usuario = await buscarUsuarioLogado(UID);
        if (!usuario) {
            throw new Error("Usuário não encontrado");
        }
        const { nome, sobrenome } = usuario;

        // Referência para a coleção de tarefas
        const tasksRef = db.collection("tasks");

        // Referência para a subcoleção da semana
        const semanaRef = tasksRef.doc(semanaId);

        // Atualizar os contadores de tarefas na coleção da semana
        await atualizarContadoresSemana(db, semanaRef);

        // Atualizar os dados do usuário
        const usuarioRef = tasksRef.doc(usuarioId);
        await atualizarDadosUsuario(db, usuarioRef);

        // Referência para a subcoleção de tarefas do usuário
        const tarefaRef = usuarioRef.collection("Tarefa");

        // Inserir a nova tarefa
        await tarefaRef.add({
            materia: materia,
            horarioInicio: horarioInicio,
            horarioTermino: horarioTermino,
            tempoEstimado: tempoEstimado,
            periodo: periodo,
            ano: ano,
            numeroSemana: numeroSemana,
            assunto: assunto,
        });

        console.log("Tarefa inserida com sucesso!");
    } catch (error) {
        console.error("Erro ao inserir tarefa:", error);
        throw new Error("Erro ao inserir tarefa");
    }
}

module.exports = { inserirTarefa };