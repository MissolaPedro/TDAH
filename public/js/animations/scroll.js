window.addEventListener('DOMContentLoaded', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const elements = document.querySelectorAll('[data-scroll]');
    elements.forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('opacity-100');
        }
    });
});

window.addEventListener('scroll', function() {
    const scrollToTopButton = document.getElementById('scrollToTop');
    if (window.scrollY > window.innerHeight / 2) {
        scrollToTopButton.classList.remove('hidden');
        scrollToTopButton.classList.add('opacity-100');
    } else {
        scrollToTopButton.classList.add('hidden');
        scrollToTopButton.classList.remove('opacity-100');
    }

    const elements = document.querySelectorAll('[data-scroll]');
    elements.forEach(element => {
        if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('opacity-100');
        }
    });
});

document.getElementById('scrollToTop').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});