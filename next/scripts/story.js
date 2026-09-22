/* Notebook page flip — click (or Enter/Space) pivots the current page
   around the binder at the top edge, revealing the next scan underneath.
   Add pages to NOTEBOOK_PAGES as scans become available; the flip cycles
   through them in order and wraps back to the first. */
const NOTEBOOK_PAGES = [
  {
    src: "/images/notebook/tea-machine.jpg",
    alt: "Child's notebook drawing of a steam-powered tea machine, annotated with labels for the cold water tank, ratchet gear, weights, paddle and milk pump",
  },
  {
    src: "/images/notebook/croissant-machine.jpg",
    alt: "Child's pencil drawing titled 'quasant-making machine': a croissant factory with a pastry roller, blades, chocolate rods, a fridge, burner and pump",
  },
  // e.g. { src: "/images/notebook/page-2.jpg", alt: "..." },
];

(function () {
  const viewport = document.getElementById("notebook-flip");
  if (!viewport) return;

  const frontPage = viewport.querySelector(".notebook-page--front");
  const backPage = viewport.querySelector(".notebook-page--back");
  if (!frontPage || !backPage) return;

  const frontImg = frontPage.querySelector("img");
  const backImg = backPage.querySelector("img");

  let index = 0;
  let flipping = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(page, img, entry) {
    img.src = entry.src;
    img.alt = entry.alt;
  }

  function flip() {
    if (flipping || NOTEBOOK_PAGES.length === 0) return;
    flipping = true;

    const next = NOTEBOOK_PAGES[(index + 1) % NOTEBOOK_PAGES.length];
    show(backPage, backImg, next);

    const settle = () => {
      index = (index + 1) % NOTEBOOK_PAGES.length;
      show(frontPage, frontImg, NOTEBOOK_PAGES[index]);
      show(backPage, backImg, NOTEBOOK_PAGES[(index + 1) % NOTEBOOK_PAGES.length]);
      flipping = false;
    };

    if (reduceMotion) {
      settle();
      return;
    }

    // Pivot the front page around the binder (top edge). Past ~90deg the
    // page stands up toward the viewer and the viewport's overflow clips it
    // as it passes over the top — like a page flipping over the rings.
    const animation = frontPage.animate(
      [
        { transform: "rotateX(0deg)" },
        { transform: "rotateX(180deg)" },
      ],
      { duration: 650, easing: "ease-in-out" }
    );
    animation.finished.then(settle).catch(settle);
  }

  viewport.addEventListener("click", flip);
  viewport.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      flip();
    }
  });
})();