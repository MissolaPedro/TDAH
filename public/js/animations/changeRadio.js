// changeradio.js
document.querySelectorAll('input[name="categoria"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      document.querySelectorAll('input[name="categoria"]').forEach((r) => {
        r.nextElementSibling.classList.remove('border-primary-600');
        r.nextElementSibling.classList.add('border-neutral-800');
      });
      event.target.nextElementSibling.classList.remove('border-neutral-800');
      event.target.nextElementSibling.classList.add('border-primary-600');
    });
  });