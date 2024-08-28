document.addEventListener('DOMContentLoaded', function() {
    const currentDateElement = document.getElementById('diasemana');

    // Cria um novo objeto Date para obter a data atual
    const today = new Date();

    // Obtém o dia da semana e o formata em texto
    const daysOfWeek = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    const dayOfWeek = daysOfWeek[today.getDay()]; // getDay() retorna o índice do dia da semana

    // Obtém o dia do mês, o mês e o ano
    const day = today.getDate();
    const month = today.getMonth() + 1; // getMonth() retorna o índice do mês (0-11)
    const year = today.getFullYear();

    // Formata a data como "Dia da Semana, Dia de Mês de Ano"
    const formattedDate = `${dayOfWeek}, ${day}/${month}/${year}`;

    // Exibe a data formatada no elemento HTML
    currentDateElement.textContent = formattedDate;
});