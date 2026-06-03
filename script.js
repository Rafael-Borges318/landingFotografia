/* =============================================
   JULIA MENDES · FOTOGRAFIA
   main.js — Carousel, Nav, Scroll, Filters
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ====== NAV: Scroll Behavior ====== */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ====== NAV: Hamburger ====== */
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  hamburger.addEventListener('click', () => {
    navMobile.classList.toggle('open');
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => navMobile.classList.remove('open'));
  });

  /* ====== CAROUSEL ====== */
  const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = document.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  document.getElementById('carouselNext').addEventListener('click', () => {
    next();
    resetAuto();
  });
  document.getElementById('carouselPrev').addEventListener('click', () => {
    prev();
    resetAuto();
  });

  // Touch / Swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetAuto(); }
  });

  // Auto-play
  function startAuto() { autoTimer = setInterval(next, 5000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

  /* ====== REVEAL ON SCROLL ====== */
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));

  /* ====== PORTFOLIO: sincroniza label do hover com data-cat ====== */
  const catLabels = {
    casamentos: 'Casamentos',
    ensaios: 'Ensaios',
    eventos: 'Eventos',
    familia: 'Família',
    corporativo: 'Corporativo'
  };
  document.querySelectorAll('.portfolio-item').forEach(item => {
    const span = item.querySelector('.portfolio-hover span');
    if (span && catLabels[item.dataset.cat]) {
      span.textContent = catLabels[item.dataset.cat];
    }
  });

  /* ====== PORTFOLIO FILTER ====== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      portfolioItems.forEach(item => {
        if (filter === 'all' || item.dataset.cat === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeUp 0.5s ease both';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ====== VÍDEOS: hover (desktop) e click/tap (mobile) ====== */
  const isTouch = () => window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.video-thumb').forEach(thumb => {
    const video = thumb.querySelector('video');
    const overlay = thumb.querySelector('.play-overlay');
    if (!video) return;

    // Força decodificação do primeiro frame via play+pause imediato
    const grabThumb = () => {
      video.play().then(() => {
        video.pause();
        video.currentTime = 0.1;
      }).catch(() => {
        video.currentTime = 0.1;
      });
    };
    if (video.readyState >= 3) {
      grabThumb();
    } else {
      video.addEventListener('canplay', grabThumb, { once: true });
    }

    if (isTouch()) {
      // Mobile: toque para play/pause com zoom
      thumb.addEventListener('click', () => {
        if (video.paused) {
          document.querySelectorAll('.video-thumb').forEach(t => {
            const v = t.querySelector('video');
            const o = t.querySelector('.play-overlay');
            if (v && v !== video) {
              v.pause(); v.currentTime = 0;
              t.classList.remove('playing');
              if (o) o.classList.remove('hidden');
            }
          });
          video.play();
          thumb.classList.add('playing');
          overlay.classList.add('hidden');
        } else {
          video.pause(); video.currentTime = 0;
          thumb.classList.remove('playing');
          overlay.classList.remove('hidden');
        }
      });
    } else {
      // Desktop: hover para play
      thumb.addEventListener('mouseenter', () => {
        video.play();
        overlay.classList.add('hidden');
      });
      thumb.addEventListener('mouseleave', () => {
        video.pause(); video.currentTime = 0;
        overlay.classList.remove('hidden');
      });
    }
  });

  /* ====== SMOOTH SCROLL for all internal links ====== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const offset = navbar.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});