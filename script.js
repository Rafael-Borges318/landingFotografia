
document.addEventListener('DOMContentLoaded', () => {

    const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

    const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

    const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('navMobile');
  hamburger.addEventListener('click', () => {
    const isOpen = navMobile.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => navMobile.classList.remove('open'));
  });

    const track = document.getElementById('carouselTrack');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = document.querySelectorAll('.carousel-slide');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

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

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); resetAuto(); }
  });

  function startAuto() { autoTimer = setInterval(next, 5000); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  startAuto();

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

    const PORTFOLIO_PAGE_SIZE = 12;
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = Array.from(document.querySelectorAll('.portfolio-item'));
  const portfolioMoreBtn = document.getElementById('portfolioMore');

  let activeFilter = 'all';
  let visibleCount = PORTFOLIO_PAGE_SIZE;

  const matchesActiveFilter = item => activeFilter === 'all' || item.dataset.cat === activeFilter;

  function renderPortfolio(revealFrom) {
    const matches = portfolioItems.filter(matchesActiveFilter);

    portfolioItems.forEach(item => item.classList.add('hidden'));

    matches.slice(0, visibleCount).forEach((item, i) => {
      item.classList.remove('hidden');
      if (i >= revealFrom) {
        item.style.animation = 'none';
        void item.offsetWidth;
        item.style.animationDelay = `${(i - revealFrom) * 60}ms`;
        item.style.animation = 'fadeUp 0.5s var(--ease-out) both';
      }
    });

    if (portfolioMoreBtn) {
      portfolioMoreBtn.style.display = matches.length > visibleCount ? 'inline-flex' : 'none';
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      visibleCount = PORTFOLIO_PAGE_SIZE;
      renderPortfolio(0);
    });
  });

  if (portfolioMoreBtn) {
    portfolioMoreBtn.addEventListener('click', () => {
      const revealFrom = visibleCount;
      visibleCount += PORTFOLIO_PAGE_SIZE;
      renderPortfolio(revealFrom);
    });
  }

  const portfolioGrid = document.getElementById('portfolioGrid');
  if (portfolioGrid) {
    const portfolioObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          renderPortfolio(0);
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    portfolioObserver.observe(portfolioGrid);
  }

    const isTouch = () => window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('.video-thumb').forEach(thumb => {
    const video = thumb.querySelector('video');
    const overlay = thumb.querySelector('.play-overlay');
    if (!video) return;

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