// Rotierende Google-Bewertungen – wechselt automatisch, eine nach der anderen
(function () {
  const rotator = document.querySelector('.review-rotator');
  const dotsWrap = document.querySelector('.review-dots');
  if (!rotator || !dotsWrap) return;

  const slides = Array.from(rotator.querySelectorAll('.review-slide'));
  if (slides.length < 2) return;

  const INTERVAL = 6500;
  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
  let timer = null;

  // Navigations-Punkte erzeugen
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Bewertung ${i + 1} von ${slides.length}`);
    dot.addEventListener('click', () => { show(i); start(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.setAttribute('aria-selected', i === current ? 'true' : 'false'));
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), INTERVAL);
  }

  // Bei verstecktem Tab pausieren, danach weiterlaufen
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else start();
  });

  show(current);
  start();
})();
