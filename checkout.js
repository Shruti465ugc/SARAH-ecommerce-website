'use strict';

/* ============================================================
   SARAH — CHECKOUT SYSTEM
   Requires: products.js, cart.js, wishlist.js, app.js
   ============================================================ */

/* ---- CONSTANTS ---- */
const COUPONS = { SARAH10: 0.10, WELCOME20: 0.20 };
const GST_RATE = 0.05;
const SHIPPING_THRESHOLD = 2999;
const SHIPPING_CHARGE = 99;
const STATUSES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

/* ---- STATE ---- */
let checkoutStep = 1; // 1=address, 2=payment, 3=confirm
let appliedCoupon = null;
let appliedDiscount = 0;
let savedAddress = JSON.parse(localStorage.getItem('sarah_address') || 'null');
let orders = JSON.parse(localStorage.getItem('sarah_orders') || '[]');
let currentTrackOrder = null;

/* ============================================================
   CHECKOUT OVERLAY OPEN/CLOSE
   ============================================================ */
function openCheckout() {
  checkoutStep = 1;
  appliedCoupon = null;
  appliedDiscount = 0;
  const overlay = document.getElementById('checkout-overlay');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCheckoutSummary();
  showCheckoutPanel(1);
  if (savedAddress) showSavedAddressBanner();
}

function closeCheckout() {
  document.getElementById('checkout-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   STEP MANAGEMENT
   ============================================================ */
function showCheckoutPanel(step) {
  checkoutStep = step;
  // Update step indicators
  document.querySelectorAll('.checkout-step').forEach((el, i) => {
    el.classList.toggle('active', i + 1 === step);
    el.classList.toggle('done', i + 1 < step);
  });
  // Show panel
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`checkout-panel-${step}`)?.classList.add('active');
  // Hide success
  document.getElementById('checkout-success')?.classList.remove('active');
}

/* ============================================================
   SAVED ADDRESS BANNER
   ============================================================ */
function showSavedAddressBanner() {
  const banner = document.getElementById('saved-address-banner');
  if (!banner || !savedAddress) return;
  banner.innerHTML = `
    <div>
      <p><strong>Saved Address Found</strong></p>
      <p>${savedAddress.name} · ${savedAddress.city}, ${savedAddress.state} – ${savedAddress.pincode}</p>
    </div>
    <button class="use-saved-btn" onclick="fillSavedAddress()">Use This</button>
  `;
  banner.style.display = 'flex';
}

function fillSavedAddress() {
  if (!savedAddress) return;
  const fields = ['name','mobile','email','address','city','state','pincode'];
  fields.forEach(f => {
    const el = document.getElementById(`addr-${f}`);
    if (el) el.value = savedAddress[f] || '';
  });
  showToast('✦', 'Address filled from saved info');
}

/* ============================================================
   ADDRESS VALIDATION
   ============================================================ */
function validateAddress() {
  let valid = true;
  const rules = {
    name:    { required: true, label: 'Full Name' },
    mobile:  { required: true, pattern: /^[6-9]\d{9}$/, msg: 'Enter a valid 10-digit mobile number' },
    email:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Enter a valid email address' },
    address: { required: true, label: 'Street Address' },
    city:    { required: true, label: 'City' },
    state:   { required: true, label: 'State' },
    pincode: { required: true, pattern: /^\d{6}$/, msg: 'Enter a valid 6-digit pincode' },
  };

  Object.entries(rules).forEach(([key, rule]) => {
    const input = document.getElementById(`addr-${key}`);
    const field = input?.closest('.field');
    const errEl = field?.querySelector('.field-error');
    if (!input || !field) return;

    field.classList.remove('has-error');
    const val = input.value.trim();

    if (rule.required && !val) {
      field.classList.add('has-error');
      if (errEl) errEl.textContent = `${rule.label || key} is required`;
      valid = false;
    } else if (rule.pattern && val && !rule.pattern.test(val)) {
      field.classList.add('has-error');
      if (errEl) errEl.textContent = rule.msg || 'Invalid value';
      valid = false;
    }
  });

  return valid;
}

function getAddressData() {
  const fields = ['name','mobile','email','address','city','state','pincode'];
  const data = {};
  fields.forEach(f => { data[f] = document.getElementById(`addr-${f}`)?.value.trim() || ''; });
  return data;
}

/* ============================================================
   PAYMENT VALIDATION
   ============================================================ */
function validatePayment() {
  const method = document.querySelector('input[name="payment"]:checked')?.value;
  if (!method) { showToast('⚠️', 'Please select a payment method'); return false; }

  if (method === 'upi') {
    const upiId = document.getElementById('upi-id')?.value.trim();
    const upiField = document.getElementById('upi-id')?.closest('.field');
    if (!upiId || !/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      upiField?.classList.add('has-error');
      upiField?.querySelector('.field-error') && (upiField.querySelector('.field-error').textContent = 'Enter a valid UPI ID (e.g. name@upi)');
      return false;
    }
    upiField?.classList.remove('has-error');
  }

  if (method === 'card') {
    const fields = [
      { id: 'card-number', pattern: /^\d{16}$/, msg: 'Enter valid 16-digit card number' },
      { id: 'card-name', pattern: /\S+/, msg: 'Enter cardholder name' },
      { id: 'card-expiry', pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, msg: 'Enter expiry as MM/YY' },
      { id: 'card-cvv', pattern: /^\d{3,4}$/, msg: 'Enter valid CVV' },
    ];
    let cardValid = true;
    fields.forEach(({ id, pattern, msg }) => {
      const input = document.getElementById(id);
      const field = input?.closest('.field');
      const errEl = field?.querySelector('.field-error');
      field?.classList.remove('has-error');
      if (!input?.value.trim() || !pattern.test(input.value.replace(/\s/g, ''))) {
        field?.classList.add('has-error');
        if (errEl) errEl.textContent = msg;
        cardValid = false;
      }
    });
    if (!cardValid) return false;
  }

  return true;
}

/* ============================================================
   COUPON SYSTEM
   ============================================================ */
function applyCoupon() {
  const input = document.getElementById('coupon-input');
  const msgEl = document.getElementById('coupon-msg');
  const code = input?.value.trim().toUpperCase();

  if (!code) { if (msgEl) { msgEl.textContent = 'Enter a coupon code'; msgEl.className = 'coupon-msg error'; } return; }

  if (COUPONS[code]) {
    appliedCoupon = code;
    const subtotal = getCartTotal();
    appliedDiscount = Math.round(subtotal * COUPONS[code]);
    if (msgEl) {
      msgEl.textContent = `✓ "${code}" applied — ${(COUPONS[code]*100).toFixed(0)}% off saved!`;
      msgEl.className = 'coupon-msg success';
    }
    renderCheckoutSummary();
    showToast('🎉', `Coupon ${code} applied!`);
  } else {
    appliedCoupon = null;
    appliedDiscount = 0;
    if (msgEl) { msgEl.textContent = `"${code}" is not a valid coupon`; msgEl.className = 'coupon-msg error'; }
    renderCheckoutSummary();
  }
}

/* ============================================================
   ORDER SUMMARY CALCULATION & RENDER
   ============================================================ */
function getOrderTotals() {
  const subtotal = getCartTotal();
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
  const gst = Math.round(subtotal * GST_RATE);
  const discount = appliedDiscount;
  const grand = subtotal + shipping + gst - discount;
  return { subtotal, shipping, gst, discount, grand };
}

function renderCheckoutSummary() {
  // Items
  const itemsEl = document.getElementById('co-summary-items');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(pr => pr.id === item.id);
      if (!p) return '';
      return `
        <div class="summary-item">
          <div class="summary-item-img"><img src="${p.image}" alt="${p.name}" /></div>
          <div class="summary-item-info">
            <p class="summary-item-name">${p.name}</p>
            <p class="summary-item-brand">${p.brand}</p>
            <p class="summary-item-qty">Qty: ${item.qty}</p>
          </div>
          <span class="summary-item-price">${formatPrice(p.price * item.qty)}</span>
        </div>`;
    }).join('');
  }

  // Totals
  const { subtotal, shipping, gst, discount, grand } = getOrderTotals();
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('co-subtotal', formatPrice(subtotal));
  set('co-shipping', shipping === 0 ? 'Free' : formatPrice(shipping));
  set('co-gst', formatPrice(gst));
  set('co-discount', discount > 0 ? `−${formatPrice(discount)}` : '—');
  set('co-grand', formatPrice(grand));

  const discountRow = document.getElementById('co-discount-row');
  if (discountRow) discountRow.style.display = discount > 0 ? 'flex' : 'flex';
}

/* ============================================================
   PLACE ORDER
   ============================================================ */
function placeOrder() {
  if (!validatePayment()) return;

  const address = getAddressData();
  const method = document.querySelector('input[name="payment"]:checked')?.value;
  const { subtotal, shipping, gst, discount, grand } = getOrderTotals();

  // Save address
  localStorage.setItem('sarah_address', JSON.stringify(address));
  savedAddress = address;

  // Build order
  const orderId = `SARAH-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;
  const now = new Date();
  const deliveryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const order = {
    id: orderId,
    date: now.toISOString(),
    deliveryDate: deliveryDate.toISOString(),
    address,
    paymentMethod: method,
    items: cart.map(i => ({ ...i })),
    subtotal, shipping, gst, discount, grand,
    status: 'Processing',
  };

  orders.unshift(order);
  localStorage.setItem('sarah_orders', JSON.stringify(orders));

  // Clear cart
  cart.length = 0;
  saveCart();
  updateCartUI();

  // Show success
  showOrderSuccess(order);
}

/* ============================================================
   ORDER SUCCESS
   ============================================================ */
function showOrderSuccess(order) {
  document.querySelectorAll('.checkout-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.checkout-step').forEach(el => el.classList.add('done'));

  const panel = document.getElementById('checkout-success');
  if (!panel) return;
  panel.classList.add('active');

  const deliveryStr = new Date(order.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const methodLabel = { cod: 'Cash on Delivery', upi: 'UPI Payment', card: 'Credit / Debit Card' }[order.paymentMethod] || order.paymentMethod;

  panel.innerHTML = `
    <div class="success-icon-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h2 class="success-title">Order Placed!</h2>
    <p class="success-sub">Thank you, ${order.address.name.split(' ')[0]}. Your SARAH order is confirmed.</p>
    <div class="order-detail-card">
      <div class="order-detail-row">
        <span class="label">Order ID</span>
        <span class="value"><span class="order-id-badge">${order.id}</span></span>
      </div>
      <div class="order-detail-row">
        <span class="label">Deliver to</span>
        <span class="value">${order.address.address}, ${order.address.city}, ${order.address.state} – ${order.address.pincode}</span>
      </div>
      <div class="order-detail-row">
        <span class="label">Payment</span>
        <span class="value">${methodLabel}</span>
      </div>
      <div class="order-detail-row">
        <span class="label">Estimated Delivery</span>
        <span class="value">${deliveryStr}</span>
      </div>
      <div class="order-detail-row">
        <span class="label">Total Paid</span>
        <span class="value">${formatPrice(order.grand)}</span>
      </div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="continue-shopping-btn" onclick="closeCheckout()">Continue Shopping</button>
      <button class="view-orders-btn" onclick="closeCheckout(); openOrders();">View My Orders</button>
    </div>
    <p style="font-size:0.75rem;color:var(--text-muted);margin-top:24px;">A confirmation has been sent to ${order.address.email}</p>
  `;
  showToast('🎉', `Order ${order.id} placed successfully!`);
}

/* ============================================================
   MY ORDERS PAGE
   ============================================================ */
function openOrders() {
  orders = JSON.parse(localStorage.getItem('sarah_orders') || '[]');
  const overlay = document.getElementById('orders-overlay');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderOrders();
}

function closeOrders() {
  document.getElementById('orders-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function getStatusClass(status) {
  return 'status-' + status.replace(/\s+/g, '').toLowerCase();
}

function renderOrders() {
  const body = document.getElementById('orders-list');
  if (!body) return;

  if (orders.length === 0) {
    body.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">📦</div>
        <p>No orders yet.</p>
        <p style="font-size:0.8rem;margin-top:8px;">Your placed orders will appear here.</p>
      </div>`;
    return;
  }

  body.innerHTML = orders.map(order => {
    const dateStr = new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const thumbs = order.items.slice(0, 4).map(item => {
      const p = PRODUCTS.find(pr => pr.id === item.id);
      return p ? `<div class="order-thumb"><img src="${p.image}" alt="${p.name}" /></div>` : '';
    }).join('');
    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-card-id">${order.id}</div>
            <div class="order-card-date">${dateStr} · ${order.items.length} item${order.items.length > 1 ? 's' : ''}</div>
          </div>
          <span class="order-status-badge ${getStatusClass(order.status)}">${order.status}</span>
        </div>
        <div class="order-card-items">${thumbs}</div>
        <div class="order-card-footer">
          <span class="order-total">${formatPrice(order.grand)}</span>
          <div class="order-actions">
            <button class="track-btn" onclick="openTracking('${order.id}')">Track Order</button>
            <button class="invoice-btn" onclick="downloadInvoice('${order.id}')">📄 Invoice</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   ORDER TRACKING
   ============================================================ */
const TRACKING_STEPS = [
  { label: 'Order Placed', icon: '📋', detail: 'Your order has been received' },
  { label: 'Processing', icon: '⚙️', detail: 'Being packed at our warehouse' },
  { label: 'Shipped', icon: '🚚', detail: 'On the way to your city' },
  { label: 'Out for Delivery', icon: '📦', detail: 'With our delivery partner' },
  { label: 'Delivered', icon: '✅', detail: 'Successfully delivered' },
];

function openTracking(orderId) {
  currentTrackOrder = orders.find(o => o.id === orderId);
  if (!currentTrackOrder) return;

  const overlay = document.getElementById('tracking-overlay');
  overlay?.classList.add('open');

  const statusIdx = STATUSES.indexOf(currentTrackOrder.status);
  const currentStepIdx = statusIdx + 1; // +1 because step 0 = "Order Placed"

  const stepsHtml = TRACKING_STEPS.map((step, i) => {
    let cls = '';
    if (i < currentStepIdx) cls = 'done';
    else if (i === currentStepIdx) cls = 'current';
    return `
      <div class="timeline-step ${cls}">
        <div class="timeline-dot">${cls === 'done' ? '✓' : step.icon}</div>
        <div class="timeline-info">
          <strong>${step.label}</strong>
          <span>${step.detail}</span>
        </div>
      </div>`;
  }).join('');

  const deliveryStr = new Date(currentTrackOrder.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const sheet = document.querySelector('.tracking-sheet');
  if (sheet) {
    sheet.innerHTML = `
      <div class="tracking-sheet-header">
        <h3>Track Order</h3>
        <button class="checkout-close" onclick="closeTracking()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div style="margin-bottom:20px;">
        <span class="order-id-badge">${currentTrackOrder.id}</span>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-top:8px;">Est. delivery: ${deliveryStr}</p>
      </div>
      <div class="tracking-timeline">${stepsHtml}</div>
    `;
  }
}

function closeTracking() {
  document.getElementById('tracking-overlay')?.classList.remove('open');
}

/* ============================================================
   PDF INVOICE (jsPDF)
   ============================================================ */
function downloadInvoice(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  // Lazy-load jsPDF
  if (!window.jspdf) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => generatePDF(order);
    document.head.appendChild(script);
  } else {
    generatePDF(order);
  }
}

function generatePDF(order) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210; const margin = 20;
  let y = 20;

  // Header bar
  doc.setFillColor(201, 162, 126);
  doc.rect(0, 0, W, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('SARAH', margin, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Luxury Women\'s Fashion', margin, 30);
  doc.text('hello@sarahfashion.com  |  +91 98765 43210  |  Mumbai, India', W - margin, 30, { align: 'right' });

  y = 52;
  // Invoice title
  doc.setTextColor(43, 43, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TAX INVOICE', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(138, 122, 114);
  doc.text(`Order ID: ${order.id}`, W - margin, y, { align: 'right' });
  doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, W - margin, y + 6, { align: 'right' });

  y += 18;
  // Divider
  doc.setDrawColor(232, 216, 207);
  doc.line(margin, y, W - margin, y);

  y += 10;
  // Bill to
  doc.setTextColor(43, 43, 43);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(43, 43, 43);
  y += 6;
  doc.text(order.address.name, margin, y); y += 5;
  doc.text(order.address.address, margin, y); y += 5;
  doc.text(`${order.address.city}, ${order.address.state} – ${order.address.pincode}`, margin, y); y += 5;
  doc.text(`Mobile: ${order.address.mobile}`, margin, y); y += 5;
  doc.text(`Email: ${order.address.email}`, margin, y);

  y += 14;
  // Table header
  doc.setFillColor(247, 243, 240);
  doc.rect(margin, y - 4, W - margin * 2, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(107, 91, 82);
  const cols = [margin, 90, 130, 155, W - margin];
  doc.text('PRODUCT', cols[0], y + 2);
  doc.text('QTY', cols[1], y + 2);
  doc.text('UNIT PRICE', cols[2], y + 2);
  doc.text('TOTAL', cols[4], y + 2, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(43, 43, 43);

  order.items.forEach(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    if (!p) return;
    doc.setFontSize(8.5);
    const nameLines = doc.splitTextToSize(p.name, 60);
    doc.text(nameLines, cols[0], y);
    doc.text(String(item.qty), cols[1], y);
    doc.text(`Rs. ${p.price.toLocaleString('en-IN')}`, cols[2], y);
    doc.text(`Rs. ${(p.price * item.qty).toLocaleString('en-IN')}`, cols[4], y, { align: 'right' });
    y += nameLines.length > 1 ? 10 : 7;
    doc.setDrawColor(232, 216, 207);
    doc.line(margin, y - 2, W - margin, y - 2);
  });

  y += 8;
  // Totals block
  const addRow = (label, val, bold = false) => {
    if (bold) { doc.setFont('helvetica', 'bold'); doc.setFontSize(10); } else { doc.setFont('helvetica', 'normal'); doc.setFontSize(9); }
    doc.setTextColor(bold ? 43 : 107, bold ? 43 : 91, bold ? 43 : 82);
    doc.text(label, W - margin - 60, y);
    doc.text(val, W - margin, y, { align: 'right' });
    y += 7;
  };
  addRow('Subtotal', `Rs. ${order.subtotal.toLocaleString('en-IN')}`);
  addRow('Shipping', order.shipping === 0 ? 'Free' : `Rs. ${order.shipping.toLocaleString('en-IN')}`);
  addRow('GST (5%)', `Rs. ${order.gst.toLocaleString('en-IN')}`);
  if (order.discount > 0) addRow('Discount', `-Rs. ${order.discount.toLocaleString('en-IN')}`);
  doc.setDrawColor(201, 162, 126);
  doc.line(W - margin - 80, y - 2, W - margin, y - 2);
  y += 2;
  addRow('GRAND TOTAL', `Rs. ${order.grand.toLocaleString('en-IN')}`, true);

  y += 12;
  // Payment
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 91, 82);
  const pmLabels = { cod: 'Cash on Delivery', upi: 'UPI Payment', card: 'Credit/Debit Card' };
  doc.text(`Payment Method: ${pmLabels[order.paymentMethod] || order.paymentMethod}`, margin, y);

  y += 14;
  // Footer
  doc.setFillColor(247, 243, 240);
  doc.rect(0, 280, W, 17, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(138, 122, 114);
  doc.text('Thank you for shopping with SARAH — Luxury Fashion for the Modern Woman', W / 2, 286, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a physical signature.', W / 2, 292, { align: 'center' });

  doc.save(`SARAH-Invoice-${order.id}.pdf`);
  showToast('📄', 'Invoice downloaded!');
}

/* ============================================================
   PAYMENT FIELDS TOGGLE
   ============================================================ */
function initPaymentToggle() {
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.toggle('selected', opt.querySelector('input')?.value === radio.value);
      });
      document.querySelectorAll('.payment-fields').forEach(f => f.classList.remove('visible'));
      document.getElementById(`fields-${radio.value}`)?.classList.add('visible');
    });
  });

  // Card number formatter
  document.getElementById('card-number')?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = v;
  });
  // Expiry formatter
  document.getElementById('card-expiry')?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v;
  });
  // CVV
  document.getElementById('card-cvv')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Checkout overlay close
  document.getElementById('checkout-close-btn')?.addEventListener('click', closeCheckout);
  document.getElementById('checkout-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCheckout();
  });

  // Address next
  document.getElementById('addr-next-btn')?.addEventListener('click', () => {
    if (!validateAddress()) return;
    showCheckoutPanel(2);
    renderCheckoutSummary();
  });

  // Payment: back
  document.getElementById('pay-back-btn')?.addEventListener('click', () => showCheckoutPanel(1));

  // Payment: next (review)
  document.getElementById('pay-next-btn')?.addEventListener('click', () => {
    if (!validatePayment()) return;
    showCheckoutPanel(3);
    renderReviewPanel();
  });

  // Confirm: back
  document.getElementById('confirm-back-btn')?.addEventListener('click', () => showCheckoutPanel(2));

  // Place order
  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);

  // Coupon
  document.getElementById('apply-coupon-btn')?.addEventListener('click', applyCoupon);
  document.getElementById('coupon-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyCoupon();
  });

  // Orders overlay close
  document.getElementById('orders-close-btn')?.addEventListener('click', closeOrders);
  document.getElementById('orders-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrders();
  });

  // Tracking close
  document.getElementById('tracking-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeTracking();
  });

  // Payment field toggle init
  initPaymentToggle();

  // My Orders nav button
  document.getElementById('my-orders-nav')?.addEventListener('click', openOrders);
});

/* ============================================================
   REVIEW PANEL
   ============================================================ */
function renderReviewPanel() {
  const panel = document.getElementById('checkout-panel-3');
  if (!panel) return;

  const address = getAddressData();
  const method = document.querySelector('input[name="payment"]:checked')?.value;
  const methodLabel = { cod: 'Cash on Delivery', upi: 'UPI Payment', card: 'Credit / Debit Card' }[method] || method;
  const { subtotal, shipping, gst, discount, grand } = getOrderTotals();
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  panel.innerHTML = `
    <h2 class="panel-title">Review Order</h2>
    <div class="order-detail-card" style="margin-bottom:20px;">
      <div class="order-detail-row"><span class="label">Name</span><span class="value">${address.name}</span></div>
      <div class="order-detail-row"><span class="label">Deliver to</span><span class="value">${address.address}, ${address.city}, ${address.state} – ${address.pincode}</span></div>
      <div class="order-detail-row"><span class="label">Mobile</span><span class="value">${address.mobile}</span></div>
      <div class="order-detail-row"><span class="label">Payment</span><span class="value">${methodLabel}</span></div>
      <div class="order-detail-row"><span class="label">Est. Delivery</span><span class="value">${deliveryDate}</span></div>
    </div>
    <div class="order-detail-card">
      <div class="order-detail-row"><span class="label">Subtotal</span><span class="value">${formatPrice(subtotal)}</span></div>
      <div class="order-detail-row"><span class="label">Shipping</span><span class="value">${shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
      <div class="order-detail-row"><span class="label">GST (5%)</span><span class="value">${formatPrice(gst)}</span></div>
      ${discount > 0 ? `<div class="order-detail-row" style="color:#3aaa6a"><span class="label">Discount</span><span class="value">−${formatPrice(discount)}</span></div>` : ''}
      <div class="order-detail-row" style="font-weight:700;font-size:1rem;"><span class="label">Grand Total</span><span class="value">${formatPrice(grand)}</span></div>
    </div>
    <button class="continue-btn" id="place-order-btn">Place Order — ${formatPrice(grand)}</button>
    <button class="back-btn" id="confirm-back-btn">← Back to Payment</button>
  `;

  // Re-attach events for newly created buttons
  document.getElementById('place-order-btn')?.addEventListener('click', placeOrder);
  document.getElementById('confirm-back-btn')?.addEventListener('click', () => showCheckoutPanel(2));
}
