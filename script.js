document.addEventListener('DOMContentLoaded', function() {


  let firstScrollDone = false;
  
  window.addEventListener('wheel', function(e) {
    if (!firstScrollDone) {
      e.preventDefault();
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

      setTimeout(function() {
         document.body.classList.remove('no-scroll');
      }, 500);
    }
  }, {passive: false});



  // Listen for scroll events to shrink the landing section.
  window.addEventListener('scroll', function() {
    const landing = document.querySelector('.landing');
    const scrollPos = window.scrollY;
    const maxScroll = 300;
    const factor = Math.min(scrollPos / maxScroll, 1);
    const newWidth = 100 - 30 * factor;
    landing.style.width = newWidth + '%';
    landing.style.margin = "0 auto";
    const newRadius = 20 * factor;
    landing.style.borderRadius = newRadius + 'px';
    const newHeight = 100 - 50 * factor;
    landing.style.height = newHeight + 'vh';
  });



  // Hamburger menu toggle for mobile
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileNav = document.querySelector('.mobile-nav');
  const closeBtn = document.querySelector('.close-btn');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function() {
      mobileNav.classList.toggle('active');
    });
  }

  // Close the mobile nav when the "x" (close-btn) is clicked
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

  // Scroll-triggered flight path drawing animation
  // Select all flight paths drawn in globe.js by their class.
  const flightPaths = d3.selectAll("#globe .flight");

  // Prepare each flight path for the drawing animation by setting dash properties.
  flightPaths.each(function() {
    const totalLength = this.getTotalLength();
    d3.select(this)
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength);
  });

  // Create an Intersection Observer to detect when the globe is centered in the viewport.
  const globeElement = document.querySelector('#globe');
  const observerOptions = {
    root: null,           // Use the viewport as the root.
    threshold: 0.5        // Trigger when 50% of the globe is visible.
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Globe is centered: animate flight paths to be fully drawn.
        flightPaths.transition()
          .duration(1000)
          .attr("stroke-dashoffset", 0);
      } else {
        // Globe is off-center: animate flight paths to reset (undraw).
        flightPaths.transition()
          .duration(1000)
          .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
          });
      }
    });
  }, observerOptions);

  // Start observing the globe element.
  observer.observe(globeElement);



  // Get the header element that contains "Our Products"
  const productsHeader = document.querySelector('.heading-style-h2');


  // Get the header element that contains "Our Products"
  const productsHeaderWhite = document.querySelector('.heading-style-h2-white');

  window.addEventListener('scroll', function() {
    // For Our Products header
    const productsHeader = document.querySelector('.heading-style-h2');
    const productsRect = productsHeader.getBoundingClientRect();
    if (productsRect.top < window.innerHeight * 0.75) {
      productsHeader.classList.add('visible');
    } else {
      productsHeader.classList.remove('visible');
    }

    // For Operational Excellence header
    const productsHeaderWhite = document.querySelector('.heading-style-h2-white');
    const whiteRect = productsHeaderWhite.getBoundingClientRect();
    if (whiteRect.top < window.innerHeight * 0.75) {
      productsHeaderWhite.classList.add('visible');
    } else {
      productsHeaderWhite.classList.remove('visible');
    }
  });


  // 1. Select everything that should fade up
  const fadeUpElements = document.querySelectorAll('.fade-up');

  // 2. Create the intersection observer
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add the 'visible' class to start the transition
        entry.target.classList.add('visible');
      } else {
        // Optionally remove 'visible' when scrolled away
        // If you want the element to animate again on re-scroll, uncomment:
        // entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.15  // Adjust how much of the element must be visible
  });

  // 3. Attach observer to each fade-up element
  fadeUpElements.forEach(el => fadeObserver.observe(el));


});
