// blogs.js
const blogsData = [
  {
    category: "BLOG",
    title: "Rich History of Basmati Rice",
    thumbnail: "blogs/thumbnail/1.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGpAcma_7w/q6tRsSc83XHFnVc6UFLiWQ/view?embed",
    author: "Syeda Fizza Hussain",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-05-31"
  },
  // add more blogs here
];

document.addEventListener('DOMContentLoaded', () => {
  const carouselUL = document.querySelector('.custom-blog-carousel');
  const viewport = document.querySelector('.carousel-viewport');
  const btnPrev = document.querySelector('.prev-btn');
  const btnNext = document.querySelector('.next-btn');

  if (!carouselUL || !viewport || !btnPrev || !btnNext) {
    console.error('Carousel components (UL, viewport, or buttons) not found in DOM!');
    return;
  }

  let currentTranslateX = 0;
  let cardWidth = 260;
  const gap = 16;

  function updateCarouselCardWidth() {
    cardWidth = window.innerWidth <= 767 ? 200 : 260;
  }

  function createCardElement(blog) {
    const encodedEmbedUrl    = encodeURIComponent(blog.canvaEmbedUrl);
    const encodedAuthor      = encodeURIComponent(blog.author);
    const encodedDesignation = encodeURIComponent(blog.designation);
    const encodedPubDate     = encodeURIComponent(blog.pubDate);

    const li = document.createElement('li');
    li.tabIndex = 0;
    li.innerHTML = `
      <div class="card-wrapper">
        <img src="${blog.thumbnail}" alt="${blog.title}" loading="lazy" />
        <div class="card-content">
          <p class="card-category">${blog.category}</p>
          <h3 class="card-title">${blog.title}</h3>
          <a href="blog.html?embedUrl=${encodedEmbedUrl}&author=${encodedAuthor}&designation=${encodedDesignation}&pubDate=${encodedPubDate}" class="button w-button card-link" aria-label="Read more about ${blog.title}">Read More</a>
        </div>
      </div>
    `;

    li.addEventListener('click', e => {
      if (e.target.tagName.toLowerCase() !== 'a' && !e.target.closest('a')) {
        window.location.href = `blog.html?embedUrl=${encodedEmbedUrl}&author=${encodedAuthor}&designation=${encodedDesignation}&pubDate=${encodedPubDate}`;
      }
    });

    li.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (document.activeElement === li.querySelector('.card-link')) return;
        window.location.href = `blog.html?embedUrl=${encodedEmbedUrl}&author=${encodedAuthor}&designation=${encodedDesignation}&pubDate=${encodedPubDate}`;
      }
    });

    return li;
  }

  function populateCarouselWithData() {
    blogsData.forEach(blog => {
      carouselUL.appendChild(createCardElement(blog));
    });
  }

  function scrollCarouselLogic(direction) {
    updateCarouselCardWidth();

    const scrollStepAmount = cardWidth + gap;
    const numCardsTotal = blogsData.length;
    const totalContentWidthInUL = (numCardsTotal * cardWidth) + ((numCardsTotal - 1) * gap);

    const visibleContentWidthInViewport = window.innerWidth <= 767
      ? 200
      : (3 * 260) + (2 * gap);

    if (direction === 'next') {
      currentTranslateX -= scrollStepAmount;
    } else {
      currentTranslateX += scrollStepAmount;
    }

    const maxNegativeTranslateX = -(totalContentWidthInUL - visibleContentWidthInViewport);

    if (currentTranslateX > 0) currentTranslateX = 0;
    if (totalContentWidthInUL <= visibleContentWidthInViewport) currentTranslateX = 0;
    if (currentTranslateX < maxNegativeTranslateX) currentTranslateX = maxNegativeTranslateX;

    carouselUL.style.transform = `translateX(${currentTranslateX}px)`;
  }

  populateCarouselWithData();
  updateCarouselCardWidth();

  btnPrev.addEventListener('click', () => scrollCarouselLogic('prev'));
  btnNext.addEventListener('click', () => scrollCarouselLogic('next'));

  window.addEventListener('resize', () => {
    currentTranslateX = 0;
    carouselUL.style.transform = 'translateX(0px)';
    updateCarouselCardWidth();
  });
});
