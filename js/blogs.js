// Define your blog data with Canva embed URLs instead of PDFs
const blogsData = [
  {
    category: "BLOG",
    title: "Rich History of Basmati Rice",
    thumbnail: "blogs/thumbnail/1.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGpAcma_7w/q6tRsSc83XHFnVc6UFLiWQ/view?embed"
  },
  // Add more blogs here to test scrolling thoroughly
];

document.addEventListener('DOMContentLoaded', () => {
  const carouselUL = document.querySelector('.custom-blog-carousel'); // The UL element
  const viewport = document.querySelector('.carousel-viewport');     // The new viewport div
  const btnPrev = document.querySelector('.prev-btn');
  const btnNext = document.querySelector('.next-btn');

  if (!carouselUL || !viewport || !btnPrev || !btnNext) {
    console.error('Carousel components (UL, viewport, or buttons) not found in DOM!');
    return;
  }

  let currentTranslateX = 0;
  let cardWidth = 260; // Default desktop card width
  const gap = 16;      // Assuming 1rem = 16px for gap

  // Detect base path for GitHub Pages repo folder (adjust 'PakEuropa' to your repo name)
  const repoName = 'PakEuropa';
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const basePath = pathSegments.includes(repoName) ? `/${repoName}` : '';

  // Function to update card width based on screen size
  function updateCarouselCardWidth() {
    if (window.innerWidth <= 767) { // Matches CSS media query
      cardWidth = 200; // Mobile card width
    } else {
      cardWidth = 260; // Desktop card width
    }
  }

  // Function to create a single blog card element
  function createCardElement(blog) {
    // Build full Canva embed URL (we'll pass this as query param)
    const encodedEmbedUrl = encodeURIComponent(blog.canvaEmbedUrl);

    const li = document.createElement('li');
    li.tabIndex = 0; // For accessibility (focusable)
    li.innerHTML = `
      <div class="card-wrapper">
        <img src="${blog.thumbnail}" alt="${blog.title}" loading="lazy" />
        <div class="card-content">
          <p class="card-category">${blog.category}</p>
          <h3 class="card-title">${blog.title}</h3>
          <a href="blog.html?embedUrl=${encodedEmbedUrl}" class="button w-button card-link" aria-label="Read more about ${blog.title}">Read More</a>
        </div>
      </div>
    `;

    // Click listener for the whole card (if not clicking the link itself)
    li.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() !== 'a' && !e.target.closest('a')) {
        window.location.href = `blog.html?embedUrl=${encodedEmbedUrl}`;
      }
    });

    // Keyboard listener for 'Enter' key for accessibility
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (document.activeElement === li.querySelector('.card-link')) return;
        window.location.href = `blog.html?embedUrl=${encodedEmbedUrl}`;
      }
    });
    return li;
  }

  // Function to populate the carousel with blog cards
  function populateCarouselWithData() {
    blogsData.forEach(blog => {
      carouselUL.appendChild(createCardElement(blog));
    });
  }

  // Function to handle scrolling the carousel
  function scrollCarouselLogic(direction) {
    updateCarouselCardWidth(); // Ensure cardWidth is current for calculations

    const scrollStepAmount = cardWidth + gap; // How much to move for one card
    const numCardsTotal = blogsData.length;

    // Calculate the total width of all cards and gaps in the UL
    const totalContentWidthInUL = (numCardsTotal * cardWidth) + ((numCardsTotal - 1) * gap);

    // Determine the visible content width inside the viewport (excluding viewport's own L/R padding)
    let visibleContentWidthInViewport;
    if (window.innerWidth <= 767) {
      visibleContentWidthInViewport = 200; // 1 card of 200px
    } else {
      visibleContentWidthInViewport = (3 * 260) + (2 * gap); // 3 cards (260px) + 2 gaps
    }

    if (direction === 'next') {
      currentTranslateX -= scrollStepAmount;
    } else { // 'prev'
      currentTranslateX += scrollStepAmount;
    }

    // Clamp currentTranslateX to prevent overscrolling
    const maxNegativeTranslateX = -(totalContentWidthInUL - visibleContentWidthInViewport);

    if (currentTranslateX > 0) {
      currentTranslateX = 0; // Cannot scroll past the beginning (leftmost)
    }
    if (totalContentWidthInUL <= visibleContentWidthInViewport) {
      currentTranslateX = 0;
    } else if (currentTranslateX < maxNegativeTranslateX) {
      currentTranslateX = maxNegativeTranslateX; // Cannot scroll past the end (rightmost)
    }

    carouselUL.style.transform = `translateX(${currentTranslateX}px)`;
  }

  // Initial setup
  populateCarouselWithData();
  updateCarouselCardWidth(); // Set initial cardWidth

  // Event listeners for previous/next buttons
  btnPrev.addEventListener('click', () => scrollCarouselLogic('prev'));
  btnNext.addEventListener('click', () => scrollCarouselLogic('next'));

  // Optional: Recalculate and reset on window resize for robustness
  window.addEventListener('resize', () => {
    currentTranslateX = 0;
    carouselUL.style.transform = `translateX(0px)`;
    updateCarouselCardWidth();
  });
});
