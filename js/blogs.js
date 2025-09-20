// js/blogs.js

// ===== BLOGS (unchanged) =====
const blogsData = [
  {
    category: "BLOG",
    title: "Health Benefits of Himalayan Pink Salt",
    thumbnail: "blogs/thumbnail/4.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGqvEhGl2I/H9g7jkUmXP5Ai34dPYXmLA/view?embed",
    author: "Hina Shamsher",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-06-18"
  },
  {
    category: "BLOG",
    title: "Health Benefits of Basmati Rice",
    thumbnail: "blogs/thumbnail/3.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGqP8mL9aU/ZiWpxbsrWCEjiI62lTlW5A/view?embed",
    author: "Syeda Fizza Hussain",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-06-13"
  },
  {
    category: "BLOG",
    title: "The Real Story of Himalayan Pink Salt",
    thumbnail: "blogs/thumbnail/2.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGpemT6JbU/6hdYhUHUf41aGI_wJrIqgw/view?embed",
    author: "Syeda Fizza Hussain",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-06-05"
  },
  {
    category: "BLOG",
    title: "Rich History of Basmati Rice",
    thumbnail: "blogs/thumbnail/1.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGpAcma_7w/q6tRsSc83XHFnVc6UFLiWQ/view?embed",
    author: "Syeda Fizza Hussain",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-05-31"
  },
  {
    category: "BLOG",
    title: "Basmati vs. The Rest",
    thumbnail: "blogs/thumbnail/5.jpg",
    canvaEmbedUrl: "https://www.canva.com/design/DAGrXL4aIPQ/R3IPX59tZA5bxhnBZUoSig/view?embed",
    author: "Hina Shamsher",
    designation: "Marketing & Brand Development Team",
    pubDate: "2025-06-25"
  }
];

// ===== NEWS (new) =====
const newsData = [
  {
    id: "2025-09-budapest-memories-skybar",
    category: "NEWS",
    title: "Central Europe Connect",
    thumbnail: "news/2025-09-memories/cover.jpeg", // update with your real thumbnail
    subtitle: "",
    location: "MemoRise Skybar - Budapest, Hungary",
    eventDate: "2025-09-15",
    pubDate:   "2025-09-20",
    body: [
      "PakEuropa met with a Central Europe trade delegation and partner companies at MemoRise Skybar in Budapest. It was a fantastic evening with brilliant people and meaningful conversations around AI, innovation, trade, and legal frameworks.",
      "Special thanks to Honorary Consul John Parkerson, Honorary Consul John W. Woodward, and P&S International Strategies, LLC for bringing us together. We’re excited to keep these conversations going."
    ],
    thanks: [

    ],
    tags: ["CentralEurope","TradeMission","AI","Innovation","Trade","EMEA"],
    images: [
      {
        src: "news/2025-09-memories/abdullah-parkerson.jpeg",
        alt: "Managing Director of PakEuropa, Abdullah Naveed, with Honorary Consul General John Parkerson",
        caption: "Abdullah Naveed with Honorary Consul General & Foreign Economic Counselor of Hungary / Co-Founder P&S International — John Parkerson"
      },
      {
        src: "news/2025-09-memories/abdullah-woodward.jpg",
        alt: "Managing Director of PakEuropa, Abdullah Naveed, with Honorary Consul John W. Woodward",
        caption: "Abdullah Naveed with Honorary Consul (Slovak Republic); Managing Partner at JW Woodward Partners LLC — John W. Woodward"
      }
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const carouselUL = document.querySelector('.custom-blog-carousel');  // one combined carousel
  const viewport   = document.querySelector('.carousel-viewport');
  const btnPrev    = document.querySelector('.prev-btn');
  const btnNext    = document.querySelector('.next-btn');

  // If we're not on the home page (e.g., news.html), quietly exit.
  if (!carouselUL || !viewport || !btnPrev || !btnNext) return;

  let currentTranslateX = 0;
  let cardWidth = 260;
  const gap = 16;

  function updateCarouselCardWidth() {
    cardWidth = window.innerWidth <= 767 ? 200 : 260;
  }

  // merge & sort newest first
  function getAllPostsSorted() {
    const mark = (arr, kind) => arr.map(x => ({ ...x, _kind: kind }));
    const all = [...mark(blogsData, 'BLOG'), ...mark(newsData, 'NEWS')];
    return all.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));
  }
  const allPosts = getAllPostsSorted();

  function cardLinkHref(post) {
    if (post._kind === 'NEWS') {
      return `news.html?id=${encodeURIComponent(post.id)}`;
    }
    // BLOG route (existing behavior)
    const encodedEmbedUrl    = encodeURIComponent(post.canvaEmbedUrl);
    const encodedAuthor      = encodeURIComponent(post.author);
    const encodedDesignation = encodeURIComponent(post.designation);
    const encodedPubDate     = encodeURIComponent(post.pubDate);
    return `blog.html?embedUrl=${encodedEmbedUrl}&author=${encodedAuthor}&designation=${encodedDesignation}&pubDate=${encodedPubDate}`;
  }

  function createCardElement(post) {
    const href = cardLinkHref(post);

    const li = document.createElement('li');
    li.tabIndex = 0;
    li.innerHTML = `
      <div class="card-wrapper">
        <img src="${post.thumbnail}" alt="${post.title}" loading="lazy" />
        <div class="card-content">
          <p class="card-category">${post.category || post._kind}</p>
          <h3 class="card-title">${post.title}</h3>
          <a href="${href}" class="button w-button card-link" aria-label="Read more about ${post.title}">Read More</a>
        </div>
      </div>
    `;

    li.addEventListener('click', e => {
      if (e.target.tagName.toLowerCase() !== 'a' && !e.target.closest('a')) {
        window.location.href = href;
      }
    });

    li.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (document.activeElement === li.querySelector('.card-link')) return;
        window.location.href = href;
      }
    });

    return li;
  }

  function populateCarouselWithData() {
    allPosts.forEach(post => {
      carouselUL.appendChild(createCardElement(post));
    });
  }

  function scrollCarouselLogic(direction) {
    updateCarouselCardWidth();

    const scrollStepAmount = cardWidth + gap;
    const numCardsTotal = allPosts.length;
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
