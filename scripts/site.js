const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.reveal')
        );
        const index = siblings.indexOf(entry.target);

        window.setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.max(index, 0) * 120);

        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('visible'));
  }
}
