let images = [];
let currentIndex = 0;
let slideInterval = null;
const slideshow = document.getElementById("slideshow");
const slideImg = document.getElementById("slideImage");
const prevArrow = document.getElementById("prev");
const nextArrow = document.getElementById("next");

// Bilder von images.json laden
fetch('/images.json')
  .then(res => {
    if (!res.ok) throw new Error('images.json not found');
    return res.json();
  })
  .then(data => {
    images = Array.isArray(data) ? data : [];
    if (images.length > 0) {
      slideImg.src = images[0];
      slideImg.hidden = false;
      if (images.length > 1) {
        slideInterval = setInterval(nextSlide, 10000);
      } else {
        prevArrow.style.display = 'none';
        nextArrow.style.display = 'none';
      }
    } else {
      showEmptyState();
    }
  })
  .catch(err => {
    console.error(err);
    showEmptyState();
  });

function showEmptyState() {
  prevArrow.style.display = 'none';
  nextArrow.style.display = 'none';
  slideImg.hidden = true;
  const msg = document.createElement('div');
  msg.className = 'slideshow-empty';
  msg.textContent = 'Bilder werden bald hier zu sehen sein.';
  slideshow.appendChild(msg);
}

// Bild wechseln Funktion
function showSlide(index) {
  if (images.length === 0) return;
  currentIndex = (index + images.length) % images.length; // zyklisch
  slideImg.style.opacity = 0;
  setTimeout(() => {
    slideImg.src = images[currentIndex];
    slideImg.style.opacity = 1;
  }, 200);
}

// Nächstes/ vorheriges Bild
function nextSlide() { showSlide(currentIndex + 1); }
function prevSlide() { showSlide(currentIndex - 1); }

// Pfeile anklicken (Maus & Tastatur)
function onArrowKey(handler) {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
}
nextArrow.addEventListener('click', () => { nextSlide(); resetInterval(); });
prevArrow.addEventListener('click', () => { prevSlide(); resetInterval(); });
nextArrow.addEventListener('keydown', onArrowKey(() => { nextSlide(); resetInterval(); }));
prevArrow.addEventListener('keydown', onArrowKey(() => { prevSlide(); resetInterval(); }));

// Klick direkt auf Bild → zufällig anderes Bild
slideImg.addEventListener('click', () => {
  if (images.length < 2) return;
  let rand;
  do { rand = Math.floor(Math.random() * images.length); }
  while (rand === currentIndex);
  showSlide(rand);
  resetInterval();
});

// Reset Intervall, wenn Nutzer klickt
function resetInterval() {
  if (!slideInterval) return;
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 10000);
}
