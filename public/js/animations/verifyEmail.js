document.addEventListener('DOMContentLoaded', function () {
    const codeInputs = document.getElementById('code-inputs');
    if (codeInputs) {
        codeInputs.addEventListener('paste', function (e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const inputs = document.querySelectorAll('#code-inputs input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].value = paste[i] || '';
            }
        });
    }
});