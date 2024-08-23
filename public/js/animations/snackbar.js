window.onload = function () {
    const errorMessageElement = document.querySelector('#snackbar p');
    const errorMessage = errorMessageElement ? errorMessageElement.textContent.trim() : '';

    if (errorMessage.length > 0) {
        const snackbar = document.getElementById("snackbar");
        snackbar.classList.add("bg-error-500", "text-white", "opacity-100");
        setTimeout(function () {
            snackbar.style.opacity = "0";
        }, 5000);
    }
};

function closeSnackbar() {
    const snackbar = document.getElementById("snackbar");
    snackbar.style.opacity = "0";
    setTimeout(function () {
        snackbar.classList.remove("opacity-100");
    }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
    const closeSnackbarButton = document.querySelector('#snackbar button');
    if (closeSnackbarButton) {
        closeSnackbarButton.addEventListener('click', closeSnackbar);
    }
});