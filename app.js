
'use strict';

function showToast(icon, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3200);
}

function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('hidden');
    document.body.style.overflow = '';
  }, 1900);
  document.body.style.overflow = 'hidden';
}

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('sarah_theme') || 'light';
  html.setAttribute('data-theme', saved);

  btn?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('sarah_theme', next);
    showToast(next === 'dark' ? '🌙' : '☀️', next === 'dark' ? 'Dark mode on' : 'Light mode on');
  });
}

function initStickyNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar?.classList.add('scrolled');
    else navbar?.classList.remove('scrolled');
  }, { passive: true });
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks?.classList.toggle('mobile-open');
  });

  // Close on link click
  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      navLinks.classList.remove('mobile-open');
    });
  });
}


function initSearch() {
  const toggle = document.getElementById('search-toggle');
  const close = document.getElementById('search-close');
  const bar = document.getElementById('search-bar');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  toggle?.addEventListener('click', () => {
    bar?.classList.toggle('open');
    if (bar?.classList.contains('open')) {
      setTimeout(() => input?.focus(), 100);
    }
  });

  close?.addEventListener('click', () => {
    bar?.classList.remove('open');
    if (results) results.innerHTML = '';
    if (input) input.value = '';
  });

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!results) return;

    if (!q) { results.innerHTML = ''; return; }

    const matches = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 6);

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-result-item"><span style="color:var(--text-muted);font-size:0.85rem;">No results for "${q}"</span></div>`;
      return;
    }

    results.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="openQuickView(${p.id}); document.getElementById('search-close').click();">
        <div class="search-result-emoji">${p.emoji}</div>
        <div class="search-result-info">
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-cat">${p.category}</div>
        </div>
        <div class="search-result-price">${formatPrice(p.price)}</div>
      </div>
    `).join('');
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      bar?.classList.remove('open');
      if (results) results.innerHTML = '';
      if (input) input.value = '';
    }
  });
}


let currentFilter = 'all';
let currentPriceFilter = 'all';
let visibleCount = 8;

function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    // Category/tag filter
    let passFilter = false;
    if (currentFilter === 'all') passFilter = true;
    else if (currentFilter === 'new') passFilter = p.tags.includes('new');
    else if (currentFilter === 'bestseller') passFilter = p.tags.includes('bestseller');
    else if (currentFilter === 'sale') passFilter = p.discount > 0;
    else passFilter = p.category === currentFilter;

    // Price filter
    let passPrice = true;
    if (currentPriceFilter === 'under2000') passPrice = p.price < 2000;
    else if (currentPriceFilter === '2000-5000') passPrice = p.price >= 2000 && p.price <= 5000;
    else if (currentPriceFilter === 'above5000') passPrice = p.price > 5000;

    return passFilter && passPrice;
  });
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Remove skeletons
  grid.querySelectorAll('.skeleton-card').forEach(el => el.remove());

  const filtered = getFilteredProducts();
  const toShow = filtered.slice(0, visibleCount);

  grid.innerHTML = toShow.map(p => buildProductCard(p, isWishlisted(p.id))).join('');

  // Load more button
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = filtered.length > visibleCount ? 'inline-flex' : 'none';
  }

  // Re-init reveals
  initReveal();
  updateWishlistUI();
}

function filterByCategory(cat) {
  currentFilter = cat;
  visibleCount = 8;

  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === cat);
  });

  renderProducts();

  // Scroll to products section
  document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' });
}

function initFilterBar() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      visibleCount = 8;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
    });
  });

  document.getElementById('price-filter')?.addEventListener('change', (e) => {
    currentPriceFilter = e.target.value;
    visibleCount = 8;
    renderProducts();
  });

  document.getElementById('load-more-btn')?.addEventListener('click', () => {
    visibleCount += 4;
    renderProducts();
    showToast('✨', 'More styles loaded!');
  });
}


function renderBestSellers() {
  const grid = document.getElementById('bestsellers-grid');
  if (!grid) return;

  const bestsellers = PRODUCTS.filter(p => p.tags.includes('bestseller')).slice(0, 4);
  grid.innerHTML = bestsellers.map(p => buildProductCard(p, isWishlisted(p.id))).join('');
}


function renderTestimonials() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(buildTestimonialCard).join('');
}

/* ============================================================
   INSTAGRAM GALLERY
   ============================================================ */
function renderInstaGrid() {
  const grid = document.getElementById('insta-grid');
  if (!grid) return;
  grid.innerHTML = INSTA_ITEMS.map(buildInstaItem).join('');
}

function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const modal = document.getElementById('quick-view-modal');
  const body = document.getElementById('modal-body');
  if (!modal || !body) return;

  const discountHtml = product.discount > 0
    ? `<span class="price-original">${formatPrice(product.originalPrice)}</span><span class="price-discount">${product.discount}% off</span>`
    : '';

  const colorsHtml = product.colors.map(c =>
    `<span style="display:inline-block;padding:4px 14px;border-radius:100px;border:1px solid var(--border);font-size:0.72rem;color:var(--text-muted);margin:3px;">${c}</span>`
  ).join('');

  body.innerHTML = `
    <div class="modal-img"><img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:20px 0 0 20px;" /></div>
    <div class="modal-details">
      <p class="modal-brand">${product.brand} · ${product.category}</p>
      <h2 class="modal-title">${product.name}</h2>
      <div class="modal-rating">
        <span class="stars" style="color:var(--gold);font-size:0.85rem;">${renderStars(product.rating)}</span>
        <span style="font-size:0.8rem;color:var(--text-muted);">(${product.reviews} reviews)</span>
      </div>
      <div class="modal-pricing">
        <span class="modal-price">${formatPrice(product.price)}</span>
        ${discountHtml}
      </div>
      <p class="modal-desc">${product.description}</p>
      <div>
        <p style="font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Available Colors</p>
        <div>${colorsHtml}</div>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" onclick="addToCart(${product.id}); closeQuickView();">Add to Bag</button>
        <button class="btn-outline" onclick="toggleWishlist(${product.id}, null); closeQuickView();">
          ${isWishlisted(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  modal?.classList.add('hidden');
  document.body.style.overflow = '';
}

function initQuickView() {
  document.getElementById('modal-close')?.addEventListener('click', closeQuickView);
  document.getElementById('quick-view-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeQuickView();
  });
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const msg = document.getElementById('newsletter-msg');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email')?.value;
    if (!email) return;

    if (msg) {
      msg.textContent = `✦ You're on the list! Welcome to the SARAH Circle.`;
      msg.style.color = 'var(--gold)';
    }
    showToast('🎉', 'Welcome to the SARAH Circle!');
    form.reset();
    setTimeout(() => { if (msg) msg.textContent = ''; }, 5000);
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn?.classList.add('visible');
    else btn?.classList.remove('visible');
  }, { passive: true });

  btn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}


function initProductsWithDelay() {
  setTimeout(() => {
    renderProducts();
    renderBestSellers();
  }, 1600); // After loading screen
}

document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initThemeToggle();
  initStickyNavbar();
  initHamburger();
  initSearch();
  initFilterBar();
  initQuickView();
  initNewsletter();
  initBackToTop();
  initSmoothScroll();
  initReveal();

  // Deferred renders
  renderTestimonials();
  renderInstaGrid();
  initProductsWithDelay();

  // Re-run reveal after products are rendered
  setTimeout(initReveal, 2000);

  // Staggered hero animations
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.animationDelay = '0.3s';
  }
});

// Prevent right-click for basic asset protection
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
