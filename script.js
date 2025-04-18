// Cookie helpers
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const [key, val] = v.split('=');
    return key === name ? decodeURIComponent(val) : r;
  }, '');
}

document.addEventListener('DOMContentLoaded', function() {
  console.log("[Lang] Script loaded.");

  // === FORCE TOP ON RELOAD ===
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // === TRANSLATION STATE & FUNCTIONS ===
  let translations = {};
  let currentLang = 'en';

  function setLanguage(lang) {
    console.log("[Lang] setLanguage called with:", lang);
    if (!translations[lang]) {
      console.warn("[Lang] No translations for:", lang);
      return;
    }
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const txt = translations[lang][key];
      if (txt) el.textContent = txt;
    });
  }

  // === COOKIE CONSENT & LANGUAGE RECALL ===
  const banner     = document.getElementById('cookie-consent-banner');
  const acceptBtn  = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');

  const consent = getCookie('cookieConsent');
  if (!consent) {
    banner.style.display = 'flex';
  } else if (consent === 'true') {
    const saved = getCookie('preferredLanguage');
    if (saved) currentLang = saved;
  }

  acceptBtn.addEventListener('click', () => {
    setCookie('cookieConsent', 'true', 365);
    setCookie('preferredLanguage', currentLang, 365);
    banner.style.display = 'none';
  });

  declineBtn.addEventListener('click', () => {
    setCookie('cookieConsent', 'false', 365);
    banner.style.display = 'none';
  });

  // === LOAD TRANSLATIONS & APPLY ===
  fetch('assets/translations.json')
    .then(res => res.json())
    .then(data => {
      console.log("[Lang] Translations loaded");
      translations = data;

      // **Sync the dropdown to the currentLang**
      const desktopSelect = document.getElementById('languageSelect');
      if (desktopSelect) desktopSelect.value = currentLang;
      const mobileSelect = document.getElementById('languageSelectMobile');
      if (mobileSelect) mobileSelect.value = currentLang;

      // Now apply the text translations
      setLanguage(currentLang);
    })
    .catch(err => console.error("[Lang] Error loading translations:", err));

  // === LANGUAGE SELECTORS ===
  const langSelect = document.getElementById('languageSelect');
  if (langSelect) {
    langSelect.addEventListener('change', e => {
      const lang = e.target.value;
      console.log("[Lang] Desktop dropdown changed to:", lang);
      setLanguage(lang);
      if (getCookie('cookieConsent') === 'true') {
        setCookie('preferredLanguage', lang, 365);
      }
    });
  }
  const langSelectMobile = document.getElementById('languageSelectMobile');
  if (langSelectMobile) {
    langSelectMobile.addEventListener('change', e => {
      const lang = e.target.value;
      console.log("[Lang] Mobile dropdown changed to:", lang);
      setLanguage(lang);
      if (getCookie('cookieConsent') === 'true') {
        setCookie('preferredLanguage', lang, 365);
      }
    });
  }

  // ===============================================================
  // PART 1: Handle the initial scroll/touch to enable page scrolling
  // ===============================================================
  let firstScrollDone = false;
  function handleFirstScroll(e) {
    e.preventDefault();
    if (!firstScrollDone) {
      firstScrollDone = true;
      document.querySelector('.overlay-text').classList.add('shrink');
      document.querySelector('.scroll-text').classList.add('appear');
      document.querySelector('.landing').classList.add('no-overlay');
      setTimeout(() => document.body.classList.remove('no-scroll'), 500);
      window.removeEventListener('wheel', handleFirstScroll, { passive: false });
      window.removeEventListener('touchmove', handleFirstScroll, { passive: false });
    }
  }
  window.addEventListener('wheel', handleFirstScroll, { passive: false });
  window.addEventListener('touchmove', handleFirstScroll, { passive: false });

  // ===============================================================
  // PART 2: Shrink landing section on subsequent scrolls
  // ===============================================================
  window.addEventListener('scroll', function() {
    const landing = document.querySelector('.landing');
    const scrollPos = window.scrollY;
    const maxScroll = 300;
    const factor = Math.min(scrollPos / maxScroll, 1);
    landing.style.width        = (100 - 30 * factor) + '%';
    landing.style.margin       = '0 auto';
    landing.style.borderRadius = (20 * factor) + 'px';
    landing.style.height       = (100 - 50 * factor) + 'vh';
  });

  // ===============================================================
  // PART 3: Hamburger menu toggle for mobile
  // ===============================================================
  const bodyEl        = document.body;
  const hamburger     = document.querySelector('.hamburger-menu');
  const mobileNav     = document.querySelector('.mobile-nav');
  const closeBtnNav   = document.querySelector('.mobile-nav .close-btn');
  const mobileNavLinks= document.querySelectorAll('.mobile-nav a');

  function openNav() {
    bodyEl.classList.add('nav-open');
    mobileNav.classList.add('active');
  }
  function closeNav() {
    bodyEl.classList.remove('nav-open');
    mobileNav.classList.remove('active');
  }
  hamburger.addEventListener('click', openNav);
  closeBtnNav.addEventListener('click', closeNav);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeNav));

  let touchStartX = 0;
  mobileNav.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });
  mobileNav.addEventListener('touchend', e => {
    if (touchStartX - e.changedTouches[0].screenX > 50) {
      closeNav();
    }
  });

  // ===============================================================
  // PART 4: Animate flight paths in globe.svg when it intersects
  // ===============================================================
  const flightPaths = d3.selectAll('#globe .flight');
  flightPaths.each(function() {
    const totalLength = this.getTotalLength();
    d3.select(this)
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength);
  });
  const globeElement = document.querySelector('#globe');
  const observerOptions = { root: null, threshold: 0.5 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        flightPaths.transition().duration(1000).attr('stroke-dashoffset', 0);
      } else {
        flightPaths.transition().duration(1000).attr('stroke-dashoffset', function() {
          return this.getTotalLength();
        });
      }
    });
  }, observerOptions);
  observer.observe(globeElement);

  // ===============================================================
  // PART 5: Animate headings and fade-up elements on scroll
  // ===============================================================
  const productsHeader      = document.querySelector('.heading-style-h2');
  const productsHeaderWhite = document.querySelector('.heading-style-h2-white');

  window.addEventListener('scroll', function() {
    const rect1 = productsHeader.getBoundingClientRect();
    rect1.top < window.innerHeight * 0.75
      ? productsHeader.classList.add('visible')
      : productsHeader.classList.remove('visible');

    const rect2 = productsHeaderWhite.getBoundingClientRect();
    rect2.top < window.innerHeight * 0.75
      ? productsHeaderWhite.classList.add('visible')
      : productsHeaderWhite.classList.remove('visible');
  });

  const fadeUpElements = document.querySelectorAll('.fade-up');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });
  fadeUpElements.forEach(el => fadeObserver.observe(el));

});
