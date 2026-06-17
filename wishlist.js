
'use strict';

/* ---- STATE ---- */
let wishlist = JSON.parse(localStorage.getItem('sarah_wishlist') || '[]');

/* ---- PERSIST ---- */
function saveWishlist() {
  localStorage.setItem('sarah_wishlist', JSON.stringify(wishlist));
}

/* ---- CHECK ---- */
function isWishlisted(productId) {
  return wishlist.includes(productId);
}

/* ---- TOGGLE ---- */
function toggleWishlist(productId, btn) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  if (isWishlisted(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    btn?.classList.remove('active');
    showToast('🤍', `${product.name} removed from wishlist`);
  } else {
    wishlist.push(productId);
    btn?.classList.add('active');
    showToast('❤️', `${product.name} added to wishlist`);
  }

  saveWishlist();
  updateWishlistUI();
}

/* ---- UPDATE BADGE ---- */
function updateWishlistUI() {
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }

  // Sync heart buttons in product grid
  document.querySelectorAll('.wishlist-heart').forEach(btn => {
    const card = btn.closest('.product-card');
    if (!card) return;
    const id = parseInt(card.dataset.id);
    if (isWishlisted(id)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateWishlistUI();

  // Wishlist page toggle (opens cart-like drawer with wishlist items)
  document.getElementById('wishlist-btn')?.addEventListener('click', () => {
    if (wishlist.length === 0) {
      showToast('🤍', 'Your wishlist is empty. Start exploring!');
      return;
    }
    showToast('❤️', `You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} in your wishlist. Adding to bag…`);
    // Add all wishlisted items to cart
    wishlist.forEach(id => {
      const existing = cart.find(item => item.id === id);
      if (!existing) {
        cart.push({ id, qty: 1 });
      }
    });
    saveCart();
    updateCartUI();
    openCartPreview();
  });
});
