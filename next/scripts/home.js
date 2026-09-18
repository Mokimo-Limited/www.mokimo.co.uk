/* === Mokimo — Homepage Scripts (scripts/home.js) ===
   Case evidence carousel and scoping brief form handling.
   Loaded at the end of <body> by index.html. */

// Case Evidence Carousel: shows a window of cards (two up where the
// grid allows, one below 768px), stepping one at a time through the
// full list. Wraps at both ends; works with any number of .case-item
// cards. No-JS fallback: all cards stay visible, stacked.
(function () {
  const grid = document.getElementById('case-cards-container');
  const prevBtn = document.getElementById('case-prev');
  const nextBtn = document.getElementById('case-next');
  const counter = document.getElementById('case-counter');
  if (!grid || !prevBtn || !nextBtn) return;

  const items = Array.from(grid.querySelectorAll('.case-item'));
  if (items.length === 0) return;

  // Two cards side by side where the grid is two-column, one below 768px.
  const perView = () => window.matchMedia('(min-width: 768px)').matches ? 2 : 1;
  let start = 0;

  function render() {
    const per = perView();
    // Reorder the visible cards to [lead, second] so every step looks the
    // same: next pushes all cards one slot left (new card enters from the
    // right), prev pushes one slot right. Without this, the grid renders
    // visible cards in DOM order and the wrap step leaves the surviving
    // card in place instead of shifting it.
    const visibleCards = [];
    for (let k = 0; k < Math.min(per, items.length); k++) {
      visibleCards.push(items[(start + k) % items.length]);
    }
    visibleCards.forEach(item => grid.appendChild(item));
    items.forEach(item => {
      if (!visibleCards.includes(item)) grid.appendChild(item);
    });
    items.forEach(item => item.classList.toggle('hidden', !visibleCards.includes(item)));
    // The counter only makes sense when one card is shown at a time.
    if (counter) {
      counter.toggleAttribute('hidden', per > 1);
      counter.textContent =
        String(start + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
    }
  }

  // The shake kicks to full displacement at 25% of its run; the card
  // swap fires right then, so content changes on the kick rather than
  // in the hold. The duration is read from the computed style so the
  // swap point stays in sync with whatever timing is set in CSS.
  let stepTimer = null;

  function step(dir) {
    if (stepTimer !== null) {
      // Fast-forward an in-flight step so rapid clicks stay responsive.
      clearTimeout(stepTimer);
      stepTimer = null;
      render();
    }
    start = (start + dir + items.length) % items.length;
    grid.classList.remove('is-stepping-fwd', 'is-stepping-back');
    void grid.offsetWidth; // flush styles so a same-direction shake restarts
    grid.classList.add(dir > 0 ? 'is-stepping-fwd' : 'is-stepping-back');
    const duration =
      parseFloat(getComputedStyle(grid).animationDuration) * 1000 || 0;
    stepTimer = setTimeout(() => {
      stepTimer = null;
      render();
    }, duration * 0.25);
  }

  grid.addEventListener('animationend', () => {
    grid.classList.remove('is-stepping-fwd', 'is-stepping-back');
  });
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  // Uniform card heights: the visible pair sets the row height, so
  // different combinations would otherwise make the section height jump.
  // Measure every card at full width and pin them all to the tallest.
  let resizeTimer;
  function equalizeHeights() {
    items.forEach(item => {
      item.style.minHeight = '';
      item.classList.remove('hidden');
    });
    const tallest = Math.max(...items.map(item => item.offsetHeight));
    items.forEach(item => { item.style.minHeight = tallest + 'px'; });
    render();
  }
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(equalizeHeights, 120);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeHeights);
  }

  equalizeHeights();
})();

// Form Submission Handling
function handleFormSubmit(e) {
  e.preventDefault();
  const banner = document.getElementById('form-success-banner');
  const form = document.getElementById('project-form');

  banner.classList.remove('hidden');
  form.reset();
  banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
