const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }
}

const enquiryForm = document.querySelector('#enquiry-form');

if (enquiryForm) {
  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(enquiryForm);
    const name = data.get('name');
    const subject = `Website enquiry from ${name}`;
    const body = [
      data.get('enquiry'),
      '',
      '--',
      `Name: ${name}`,
      `Email: ${data.get('email')}`,
    ].join('\n');

    window.location.href = `mailto:hello@mokimo.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
