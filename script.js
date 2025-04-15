document.addEventListener('DOMContentLoaded', function() {

  // ===============================================================
  // PART 1: Handle the initial scroll/touch to enable page scrolling
  // ===============================================================
  let firstScrollDone = false;

  function handleFirstScroll(e) {
    // Prevent default scrolling on that first scroll so our landing transition can happen smoothly
    e.preventDefault();
    if (!firstScrollDone) {
      firstScrollDone = true;

      const landing = document.querySelector('.landing');
      const overlayText = document.querySelector('.overlay-text');
      const scrollText = document.querySelector('.scroll-text');

      // Instead of hiding the overlay text, shrink it.
      overlayText.classList.add('shrink');
      // Make the scroll text appear and apply new styling.
      scrollText.classList.add('appear');

      // Optional: if you still want to modify the landing background overlay.
      landing.classList.add('no-overlay');

      // After 0.5 second, remove 'no-scroll' from the body so the user can scroll.
      setTimeout(function() {
        document.body.classList.remove('no-scroll');
      }, 500);

      // Remove both listeners so this only happens once
      window.removeEventListener('wheel', handleFirstScroll, {passive: false});
      window.removeEventListener('touchmove', handleFirstScroll, {passive: false});
    }
  }

  // Listen for both wheel (desktop) and touchmove (mobile)
  window.addEventListener('wheel', handleFirstScroll, {passive: false});
  window.addEventListener('touchmove', handleFirstScroll, {passive: false});


  // ===============================================================
  // PART 2: Shrink landing section on subsequent scrolls
  // ===============================================================
  window.addEventListener('scroll', function() {
    const landing = document.querySelector('.landing');
    const scrollPos = window.scrollY;
    const maxScroll = 300;
    const factor = Math.min(scrollPos / maxScroll, 1);

    // Width shrinks from 100% to 70% 
    const newWidth = 100 - 30 * factor;
    landing.style.width = newWidth + '%';
    landing.style.margin = '0 auto';

    // Border-radius transitions from 0 to 20px
    const newRadius = 20 * factor;
    landing.style.borderRadius = newRadius + 'px';

    // Height transitions from 100vh to 50vh
    const newHeight = 100 - 50 * factor;
    landing.style.height = newHeight + 'vh';
  });


  // ===============================================================
  // PART 3: Hamburger menu toggle for mobile
  // ===============================================================
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.close-btn');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      mobileNav.classList.toggle('active');
    });
  }

  if (closeBtn && mobileNav) {
    closeBtn.addEventListener('click', function() {
      mobileNav.classList.remove('active');
    });
  }

  // (Optional) Close mobile nav when a mobile link is clicked
  const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('active');
    });
  });

  // Swipe gesture detection on mobile nav (close on swipe left)
  let touchStartX = 0;
  mobileNav.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  mobileNav.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].screenX;
    // If swiped left more than 50px, close the nav
    if (touchStartX - touchEndX > 50) {
      mobileNav.classList.remove('active');
    }
  });


  // ===============================================================
  // PART 4: Animate flight paths in globe.svg when it intersects
  // ===============================================================
  // 1. Select all flight paths
  const flightPaths = d3.selectAll('#globe .flight');

  // 2. Setup stroke-dash for each path
  flightPaths.each(function() {
    const totalLength = this.getTotalLength();
    d3.select(this)
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength);
  });

  // 3. Intersection Observer to detect when #globe is in viewport
  const globeElement = document.querySelector('#globe');
  const observerOptions = {
    root: null,
    threshold: 0.5  // 50% visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate flight paths to be fully drawn
        flightPaths.transition()
          .duration(1000)
          .attr('stroke-dashoffset', 0);
      } else {
        // Reset paths to "undrawn" state
        flightPaths.transition()
          .duration(1000)
          .attr('stroke-dashoffset', function() {
            return this.getTotalLength();
          });
      }
    });
  }, observerOptions);

  observer.observe(globeElement);


  // ===============================================================
  // PART 5: Animate headings and fade-up elements on scroll
  // ===============================================================
  // For "Our Products" heading
  const productsHeader = document.querySelector('.heading-style-h2');

  // For "Where we operate" heading
  const productsHeaderWhite = document.querySelector('.heading-style-h2-white');

  window.addEventListener('scroll', function() {
    // Animate the "Our Products" heading
    const productsRect = productsHeader.getBoundingClientRect();
    if (productsRect.top < window.innerHeight * 0.75) {
      productsHeader.classList.add('visible');
    } else {
      productsHeader.classList.remove('visible');
    }

    // Animate the "Where we operate" heading
    const whiteRect = productsHeaderWhite.getBoundingClientRect();
    if (whiteRect.top < window.innerHeight * 0.75) {
      productsHeaderWhite.classList.add('visible');
    } else {
      productsHeaderWhite.classList.remove('visible');
    }
  });

  // Fade-up elements using Intersection Observer
  const fadeUpElements = document.querySelectorAll('.fade-up');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } 
      // If you want the element to fade up again upon re-scrolling, 
      // comment out or remove the next else block
      // else {
      //   entry.target.classList.remove('visible');
      // }
    });
  }, { threshold: 0.15 });

  fadeUpElements.forEach(el => fadeObserver.observe(el));

});
