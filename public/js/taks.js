// Função para validar o formato de horário no formato HH:MM
function validateTime(timeString) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeString);
}

// Função para validar os campos do formulário
function validateForm() {
    const startTimeInput = document.getElementById('horacomeco').value;
    const endTimeInput = document.getElementById('horatermino').value;

    let isValid = true;
    let errorMessage = '';
    
    if (!validateTime(startTimeInput)) {
        errorMessage += 'Horário de início inválido. O formato correto é HH:MM.\n';
        isValid = false;
    }

    if (!validateTime(endTimeInput)) {
        errorMessage += 'Horário de término inválido. O formato correto é HH:MM.\n';
        isValid = false;
    }

    if (!isValid) {
        alert(errorMessage);
    }

    return isValid;
}

// Adiciona um ouvinte de evento para validação do formulário ao enviar
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('myForm');
    if (form) {
        form.addEventListener('submit', (event) => {
            if (!validateForm()) {
                event.preventDefault(); // Impede o envio do formulário se a validação falhar
            }
        });
    }
});
