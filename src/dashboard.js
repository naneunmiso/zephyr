// ── SAKURA PETALS ────────────────────────────────────────────
export function initSakura() {
  function spawnPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    const size = Math.random() * 10 + 6;
    const left = Math.random() * 100;
    const duration = Math.random() * 8 + 8;
    const delay = Math.random() * 5;
    petal.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}vw;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), (duration + delay) * 1000);
  }
  for (let i = 0; i < 8; i++) spawnPetal();
  setInterval(spawnPetal, 1200);
}

// ── CARD MOUSE GLOW ──────────────────────────────────────────
export function initCardGlow() {
  document.querySelectorAll('.dash-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
      const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
      card.style.setProperty('--mx', `${x}%`);
      card.style.setProperty('--my', `${y}%`);
    });
  });
}

// ── GUESTBOOK LOCAL STORAGE ──────────────────────────────────
export function initGuestbook() {
  const form = document.getElementById('wish-form');
  const grid = document.getElementById('wishes-grid');
  if (!form || !grid) return;

  const wishes = JSON.parse(localStorage.getItem('mg_wishes') || '[]');

  function renderWishes() {
    grid.innerHTML = '';
    wishes.forEach(w => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `<p>"${w.message}"</p><span>— ${w.name}</span>`;
      grid.prepend(card);
    });
  }

  renderWishes();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('wish-name').value.trim();
    const message = document.getElementById('wish-message').value.trim();
    if (!name || !message) return;
    wishes.unshift({ name, message, date: new Date().toISOString() });
    localStorage.setItem('mg_wishes', JSON.stringify(wishes));
    renderWishes();
    form.reset();
  });
}

// ── LETTERS SWIPER ───────────────────────────────────────────
export function initLetters() {
  if (!document.querySelector('.letters-swiper')) return;
  if (typeof Swiper === 'undefined') return;

  new Swiper('.letters-swiper', {
    effect: 'cards',
    grabCursor: true,
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    cardsEffect: { perSlideOffset: 10, perSlideRotate: 3, rotate: true }
  });
}

// ── MEMORIES LAZY LOAD ───────────────────────────────────────
export function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src;
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => observer.observe(img));
}

// ── VIDEO INTERACTION ────────────────────────────────────────
export function initVideos() {
  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    card.addEventListener('click', () => {
      if (video.paused) {
        // Pause all other videos
        document.querySelectorAll('video').forEach(v => {
          if (v !== video) {
            v.pause();
            v.parentElement.classList.remove('playing');
          }
        });
        video.play();
        video.muted = false;
        card.classList.add('playing');
      } else {
        video.pause();
        card.classList.remove('playing');
      }
    });
  });
}

// ── PAGE TRANSITION ──────────────────────────────────────────
export function initPageTransitions() {
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.hostname !== location.hostname) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.href;
      document.body.style.transition = 'opacity 0.35s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 360);
    });
  });
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });
}
