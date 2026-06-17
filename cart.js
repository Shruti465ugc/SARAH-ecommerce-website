
'use strict';
let cart = JSON.parse(localStorage.getItem('sarah_cart') || '[]');
function saveCart() {
  localStorage.setItem('sarah_cart', JSON.stringify(cart));
}
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
    showToast('💛', `${product.name} quantity updated`);
  } else {
    cart.push({ id: productId, qty: 1 });
    showToast('🛍️', `${product.name} added to bag`);
  }

  saveCart();
  updateCartUI();
  openCartPreview();
}

/* ---- REMOVE ---- */
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartPreview();
}

/* ---- UPDATE QTY ---- */
function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartPreview();
}

/* ---- GET TOTAL ---- */
function getCartTotal() {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

/* ---- GET COUNT ---- */
function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ---- UPDATE BADGE ---- */
function updateCartUI() {
  const count = getCartCount();
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

/* ---- RENDER CART PREVIEW ---- */
function renderCartPreview() {
  const container = document.getElementById('cart-preview-items');
  const totalEl = document.getElementById('cart-preview-total');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛍️</div>
        <p>Your bag is empty.</p>
        <p style="font-size:0.8rem;margin-top:6px;color:var(--text-muted)">Discover luxury fashion crafted for you.</p>
      </div>`;
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  container.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${p.image}" alt="${p.name}" /></div>
        <div class="cart-item-info">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-brand">${p.brand}</p>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQty(${p.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
            <span class="cart-item-price">${formatPrice(p.price * item.qty)}</span>
            <span class="remove-cart-item" onclick="removeFromCart(${p.id})">Remove</span>
          </div>
        </div>
      </div>`;
  }).join('');

  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

/* ---- OPEN / CLOSE CART ---- */
function openCartPreview() {
  const preview = document.getElementById('cart-preview');
  const overlay = document.getElementById('cart-overlay');
  if (!preview || !overlay) return;
  renderCartPreview();
  preview.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCartPreview() {
  const preview = document.getElementById('cart-preview');
  const overlay = document.getElementById('cart-overlay');
  if (!preview || !overlay) return;
  preview.classList.add('hidden');
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  document.getElementById('cart-toggle-btn')?.addEventListener('click', openCartPreview);
  document.getElementById('close-cart-preview')?.addEventListener('click', closeCartPreview);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCartPreview);

  document.getElementById('checkout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (cart.length === 0) { showToast('🛍️', 'Your bag is empty!'); return; }
    closeCartPreview();
    openCheckout();
  });

  document.getElementById('view-cart-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    // Keep open – could scroll or open full cart page
  });
});
