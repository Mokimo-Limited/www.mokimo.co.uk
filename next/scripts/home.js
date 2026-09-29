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

  // Hand-pinned randomness: every render, each visible print gets a fresh
  // tilt — capped at ±1.2deg, the maximum the old fixed alternation used —
  // and each of its pins gets a small position jitter plus a slight 3D tilt
  // (tight perspective, so the heads read as pushed in at slightly
  // different angles). Applied as inline styles — continuous values, not a
  // fixed variant palette — and re-rolled on every step, so no two views
  // look identical.
  const rand = (min, max) => min + Math.random() * (max - min);

  // Human-random, not true-random: true randomness regularly produces
  // near-identical neighbours (both prints at ~-1deg reads as a machine-set
  // row). So angles are rolled freely, then any that land within
  // MIN_SEPARATION of an already-shown angle are re-rolled — the pair
  // always reads as distinctly, separately placed.

	const MAX_ANGLE = 0.8; //deg
  const MIN_SEPARATION = 0.6; // % of MAX_ANGLE

  function scatterPins(cards) {
    const angles = cards.map(() => rand(-MAX_ANGLE, MAX_ANGLE));
    for (let i = 1; i < angles.length; i++) {
      let tries = 0;
      while (
        angles.slice(0, i).some(a => Math.abs(a - angles[i]) < (MAX_ANGLE*MIN_SEPARATION)) &&
        tries < 20
      ) {
        angles[i] = rand(-1.2, 1.2);
        tries++;
      }
    }
    cards.forEach((card, i) => {
      const print = card.querySelector('.case-print');
      if (print) print.style.rotate = `${angles[i].toFixed(2)}deg`;
      card.querySelectorAll('.case-pin').forEach(pin => {
        pin.style.translate =
          `${rand(-4, 4).toFixed(1)}px ${rand(-3, 2).toFixed(1)}px`;
        pin.style.transform =
          `perspective(24px) rotateX(${rand(-12, 12).toFixed(1)}deg)` +
          ` rotateY(${rand(-12, 12).toFixed(1)}deg) rotate(${rand(-8, 8).toFixed(1)}deg)`;
      });
    });
  }

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
    scatterPins(visibleCards);
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

// Scoping Brief Form: POSTs to the guest inquiry endpoint on the ERPNext
// stack, which rate-limits by IP and synchronously sends the confirmation
// and internal emails. The success banner only replaces the form when the
// API reports that both emails actually went out; any failure restores the
// form with an error note so the visitor can retry.

const INQUIRY_ENDPOINT =
  'https://dash.mokimo.co.uk/api/method/mokimo.api_web_enquiry.guest_submit_enquiry';

function inquiryServerError(reply) {
  // Frappe error payloads carry the human-readable message in
  // _server_messages (a JSON string of JSON strings); rate limiting
  // arrives as exc_type: 'RateLimitExceeded'.
  if (!reply) return null;
  if (typeof reply.exc_type === 'string' && reply.exc_type.startsWith('RateLimitExceeded')) {
    return 'Too many submissions from this connection recently.';
  }
  try {
    const messages = JSON.parse(reply._server_messages || '[]');
    const text = messages
      .map((m) => {
        const item = typeof m === 'string' ? JSON.parse(m) : m;
        return item && item.message;
      })
      .filter(Boolean)
      .join(' ');
    return text || null;
  } catch (err) {
    return null;
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('project-form');
  const successBanner = document.getElementById('form-success-banner');
  const errorBanner = document.getElementById('form-error-banner');
  const errorDetail = errorBanner.querySelector('.form-error__detail');
  const button = form.querySelector('button[type="submit"]');
  const idleLabel = button.textContent;

  const payload = {
    name: document.getElementById('name').value,
    company: document.getElementById('company').value,
    email: document.getElementById('email').value,
    discipline: document.getElementById('discipline').value,
    message: document.getElementById('message').value,
    website: document.getElementById('website-hp').value, // honeypot
  };

  errorBanner.classList.add('hidden');
  button.disabled = true;
  button.textContent = 'Sending\u2026';

  let reply = null;
  try {
    const response = await fetch(INQUIRY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify(payload),
    });
    reply = await response.json().catch(() => null);
    const result = reply && reply.message;
    if (response.ok && result && result.ok) {
      form.classList.add('hidden');
      successBanner.classList.remove('hidden');
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
  } catch (err) {
    reply = null; // network or CORS failure — fall through to the error path
  }

  const serverDetail = inquiryServerError(reply);
  if (serverDetail) {
    errorDetail.textContent = serverDetail;
    errorDetail.classList.remove('hidden');
  } else {
    errorDetail.classList.add('hidden');
  }
  errorBanner.classList.remove('hidden');
  button.disabled = false;
  button.textContent = idleLabel;
  errorBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
