/* === Mokimo — Work Hub Scripts (scripts/work.js) ===
   Lightbox viewer for the solo photo prints. Loaded at the end of <body>
   by work/index.html. */

// Photo Lightbox: the solo prints are real anchors to the raw .jpg, so the
// page works without JS; here their default is swapped for an in-page
// viewer — the photo in a postcard frame over a darkened backdrop. Close
// via the X, clicking the backdrop, or Escape. Scroll is locked while open
// and focus is handed to the close button, then returned to the thumbnail.
(function () {
  const triggers = Array.from(document.querySelectorAll('a.case-print--solo'));
  if (triggers.length === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML =
    '<div class="lightbox__backdrop"></div>' +
    '<figure class="lightbox__frame case-print">' +
    '<button class="btn btn--secondary lightbox__close" type="button" aria-label="Close photo viewer">&times;</button>' +
    '<span class="case-print__window"><img class="lightbox__img" alt=""></span>' +
    '<span class="case-vis__caption"></span>' +
    '</figure>';
  document.body.appendChild(overlay);

  const frame = overlay.querySelector('.lightbox__frame');
  const img = overlay.querySelector('.lightbox__img');
  const caption = overlay.querySelector('.case-vis__caption');
  const closeBtn = overlay.querySelector('.lightbox__close');
  let lastTrigger = null;

  function open(trigger) {
    lastTrigger = trigger;
    const thumb = trigger.querySelector('img');
    img.src = trigger.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    const cap = trigger.querySelector('.case-vis__caption');
    caption.textContent = cap ? cap.textContent : '';
    overlay.setAttribute('aria-label', trigger.getAttribute('aria-label') || 'Photo viewer');
    overlay.hidden = false;
    document.body.style.overflow = 'hidden'; // lock page scroll behind the overlay
    closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    img.src = ''; // drop the full-size photo once closed
    if (lastTrigger) lastTrigger.focus();
    lastTrigger = null;
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open(trigger);
    });
  });

  closeBtn.addEventListener('click', close);

  // Clicking the backdrop (anything outside the frame) closes.
  overlay.addEventListener('click', (event) => {
    if (!frame.contains(event.target)) close();
  });

  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      close();
      return;
    }
    // The close button is the overlay's only focusable element, so Tab is
    // folded back onto it — focus can't escape into the locked page behind.
    if (event.key === 'Tab' && document.activeElement !== closeBtn) {
      event.preventDefault();
      closeBtn.focus();
    }
  });
})();
