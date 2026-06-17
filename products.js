
'use strict';

const PRODUCTS = [
  {
    id: 1, name: "Rose Petal Wrap Dress", brand: "SARAH",
    category: "Dresses", price: 4299, originalPrice: 6499,
    discount: 34, rating: 4.8, reviews: 218,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop",
    tags: ["new", "sale"], description: "A dreamy wrap silhouette in soft rose crepe. Adjustable tie waist for a flattering fit on all body types. Perfect for evenings out or weekend brunches.",
    colors: ["Rose", "Blush", "Ivory"]
  },
  {
    id: 2, name: "Golden Hour Co-Ord Set", brand: "SARAH",
    category: "Co-Ords", price: 5499, originalPrice: 7999,
    discount: 31, rating: 4.9, reviews: 312,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80&fit=crop",
    tags: ["bestseller", "new"], description: "A luxe co-ord set in champagne-gold satin. The structured blazer and high-waist trouser combo exudes modern power dressing at its finest.",
    colors: ["Gold", "Ivory", "Black"]
  },
  {
    id: 3, name: "Ivory Lace Midi Dress", brand: "SARAH",
    category: "Dresses", price: 3799, originalPrice: 3799,
    discount: 0, rating: 4.7, reviews: 145,
    image: "https://www.simplydresses.com/cdn/shop/collections/white-dress-NA-22-JE931-a_1000x1666_54d45b3a-4b01-4877-a372-75251601167a_1200x1999.jpg?v=1690314855",
    imageAlt: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80&fit=crop",
    tags: ["new"], description: "Exquisite French lace midi dress with delicate scallop trim. Fully lined with a back zip closure. An heirloom-worthy piece for your wardrobe.",
    colors: ["Ivory", "Champagne"]
  },
  {
    id: 4, name: "Nude Structured Tote", brand: "SARAH",
    category: "Handbags", price: 6999, originalPrice: 9999,
    discount: 30, rating: 4.9, reviews: 421,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1591561954555-607968c989ab?w=600&q=80&fit=crop",
    tags: ["bestseller", "sale"], description: "Crafted from premium full-grain vegan leather. Structured design with gold-tone hardware and suede interior. Fits 13\" laptop. A forever bag.",
    colors: ["Nude", "Black", "Tan"]
  },
  {
    id: 5, name: "Floral Print Boho Top", brand: "SARAH",
    category: "Tops", price: 1899, originalPrice: 2799,
    discount: 32, rating: 4.6, reviews: 89,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80&fit=crop",
    tags: ["sale", "new"], description: "A breezy floral-print top in 100% organic cotton. Relaxed silhouette with puffed sleeves. Pairs beautifully with wide-leg trousers or denim.",
    colors: ["Floral Pink", "Floral Blue"]
  },
  {
    id: 6, name: "Anarkali Embroidered Kurta", brand: "SARAH",
    category: "Ethnic Wear", price: 4599, originalPrice: 6999,
    discount: 34, rating: 4.8, reviews: 267,
    image: "https://images.unsplash.com/photo-1756483509254-3cc48a5a15b2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZXRobmljJTIwd2VhcnxlbnwwfHwwfHx8MA%3D%3D",
    imageAlt: "https://www.inweaveindia.com/cdn/shop/files/1_ef669a88-42fa-4076-844b-e227a8e458ba_1080x1440.jpg?v=1691572236",
    tags: ["bestseller", "sale"], description: "A statement Anarkali in rich georgette with hand-embroidered zardozi work. Comes with matching palazzo and dupatta. Festive luxury redefined.",
    colors: ["Royal Blue", "Emerald", "Crimson"]
  },
  {
    id: 7, name: "Pearl Drop Earrings", brand: "SARAH",
    category: "Accessories", price: 1299, originalPrice: 1299,
    discount: 0, rating: 4.9, reviews: 534,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80&fit=crop",
    tags: ["bestseller"], description: "Cultured freshwater pearl drops with 18k gold-plated sterling silver hooks. Hypoallergenic. A classic that pairs with everything in your wardrobe.",
    colors: ["White Pearl", "Pink Pearl"]
  },
  {
    id: 8, name: "Sage Linen Blazer", brand: "SARAH",
    category: "Co-Ords", price: 4999, originalPrice: 7499,
    discount: 33, rating: 4.7, reviews: 178,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&q=80&fit=crop",
    tags: ["new", "sale"], description: "Italian linen blazer in calming sage. Relaxed fit with notched lapels and gold-tone buttons. Versatile enough to dress up or down effortlessly.",
    colors: ["Sage", "Ecru", "Dusty Rose"]
  },
  {
    id: 9, name: "Midnight Velvet Dress", brand: "SARAH",
    category: "Dresses", price: 6299, originalPrice: 9299,
    discount: 32, rating: 5.0, reviews: 196,
    image: "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&fit=crop",
    tags: ["bestseller", "sale"], description: "Opulent midnight velvet mini dress with a cowl neckline and ruched detailing. This is the dress made for unforgettable evenings.",
    colors: ["Midnight Black", "Deep Plum"]
  },
  {
    id: 10, name: "Terracotta Palazzo Set", brand: "SARAH",
    category: "Ethnic Wear", price: 3299, originalPrice: 4999,
    discount: 34, rating: 4.6, reviews: 143,
    image: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80&fit=crop",
    tags: ["new"], description: "Earth-toned palazzo set in soft modal fabric. Features block-print detailing and tassel drawstring. Comfort meets bohemian elegance.",
    colors: ["Terracotta", "Rust", "Ochre"]
  },
  {
    id: 11, name: "Crystal Chain Bag", brand: "SARAH",
    category: "Handbags", price: 3999, originalPrice: 5999,
    discount: 33, rating: 4.8, reviews: 287,
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&fit=crop",
    tags: ["new", "sale"], description: "A micro bag that makes a maxi statement. Genuine suede with crystal-embellished chain strap. Lined in printed silk. Party essential.",
    colors: ["Amethyst", "Nude", "Onyx"]
  },
  {
    id: 12, name: "Pendent", brand: "SARAH",
    category: "Accessories", price: 899, originalPrice: 1399,
    discount: 36, rating: 4.7, reviews: 612,
    image: "https://images.unsplash.com/photo-1763256614642-9dedc87763c7?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageAlt: "https://a.1stdibscdn.com/archivesE/upload/1121189/j_195222821686638588202/19522282_datamatics.jpg?disable=upscale&auto=webp&quality=60&width=800",
    tags: ["bestseller", "sale"], description: "100% pure silk twill scarf with hand-rolled edges. Wear as a neckerchief, bag accessory, or headband. Printed with SARAH's signature floral motif.",
    colors: ["Blush", "Gold", "Sky Blue", "Emerald"]
  },
  {
    id: 13, name: "Off-Shoulder Frill Top", brand: "SARAH",
    category: "Tops", price: 2199, originalPrice: 2199,
    discount: 0, rating: 4.5, reviews: 77,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop",
    imageAlt:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80&fit=crop",
    tags: ["new"], description: "Feminine off-shoulder top with layered frills in soft georgette. The elasticated neckline allows flexible styling. Light and airy for summer.",
    colors: ["Dusty Rose", "Ivory", "Powder Blue"]
  },
  {
    id: 14, name: "Gold Cuff Bracelet", brand: "SARAH",
    category: "Accessories", price: 1599, originalPrice: 2499,
    discount: 36, rating: 4.8, reviews: 318,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80&fit=crop",
    tags: ["bestseller", "sale"], description: "Statement wide cuff in 18k gold-plated brass with hammered texture. Adjustable band fits most wrists. Gift-ready in a SARAH luxury box.",
    colors: ["Gold", "Rose Gold", "Silver"]
  },
  {
    id: 15, name: "Sharara Lehenga Set", brand: "SARAH",
    category: "Ethnic Wear", price: 8999, originalPrice: 13999,
    discount: 36, rating: 4.9, reviews: 224,
    image: "https://assets.myntassets.com/h_200,w_200,c_fill,g_auto/h_1440,q_100,w_1080/v1/assets/images/2025/MAY/28/ztLSRpl0_448894ff105f4ca087e7b9d0e1e04cc1.jpg",
    imageAlt: "https://i.pinimg.com/originals/12/53/e3/1253e3e3b0878fbe99a1dfa39686ebb9.jpg",
    tags: ["bestseller", "new"], description: "Bridal-worthy Sharara lehenga in tissue organza with sequin embroidery throughout. Set includes blouse, lehenga, and dupatta. A showstopper.",
    colors: ["Ivory Gold", "Blush Pink", "Cobalt"]
  },
  {
    id: 16, name: "Minimalist Rib-Knit Set", brand: "SARAH",
    category: "Co-Ords", price: 3499, originalPrice: 4999,
    discount: 30, rating: 4.7, reviews: 165,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80&fit=crop",
    imageAlt: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80&fit=crop",
    tags: ["sale", "new"], description: "A luxury rib-knit co-ord in fine Italian yarn. The cropped top and flared skirt pair perfectly. Effortlessly chic for any occasion.",
    colors: ["Camel", "Cream", "Chocolate"]
  }
];

const TESTIMONIALS = [
  { name: "Priya Sharma", tag: "Fashion Blogger", rating: 5, text: "SARAH has completely elevated my wardrobe. Every piece I've bought feels like it was made just for me — the quality is outstanding.", avatar: "👩‍💼" },
  { name: "Ananya Verma", tag: "Loyal Customer · 2 yrs", rating: 5, text: "The Midnight Velvet Dress was everything I dreamed of. I wore it to a gala and received compliments the entire evening. Worth every rupee.", avatar: "👩" },
  { name: "Meera Iyer", tag: "Influencer @meera.style", rating: 5, text: "I've ordered from SARAH three times this season. The fabrics, the cuts, the packaging — it's a full luxury experience from click to delivery.", avatar: "🧕" },
  { name: "Divya Nair", tag: "Verified Buyer", rating: 5, text: "Finally a brand that understands the modern Indian woman. The ethnic wear collection is breathtaking and the fits are absolutely perfect.", avatar: "👸" },
  { name: "Rhea Kapoor", tag: "Style Enthusiast", rating: 4, text: "SARAH's accessories collection is a hidden gem. The pearl earrings and silk scarf together are such a chic combination. 100% recommend.", avatar: "💁‍♀️" },
  { name: "Shreya Gupta", tag: "Premium Member", rating: 5, text: "The customer service is as luxurious as the products. When I had a sizing concern, they resolved it instantly. Truly a five-star experience.", avatar: "👩‍🦰" }
];

const INSTA_ITEMS = [
  { image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80&fit=crop&crop=center", label: "Summer Dress Mood", bg: "linear-gradient(135deg,#e8cfc3,#c9a27e)" },
  { image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop&crop=center", label: "Bag of the Day", bg: "linear-gradient(135deg,#d4bfb0,#b08a6e)" },
  { image: "https://lookzlike.com/cdn/shop/collections/womens-accessories-2391638.png?v=1752973192", label: "Accessorize", bg: "linear-gradient(135deg,#f5ece6,#ddb99a)" },
  { image: "https://img.theloom.in/blog/wp-content/uploads/2026/01/thumb-6-480x650.png", label: "Ethnic Beauty", bg: "linear-gradient(135deg,#c9a27e,#a07855)" },
  { image: "https://i.pinimg.com/736x/2f/8d/14/2f8d145d22a4f67227b775a717159f5a.jpg", label: "Golden Hour OOTD", bg: "linear-gradient(135deg,#f0e0d0,#c9a27e)" },
  { image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80&fit=crop&crop=center", label: "Floral Season", bg: "linear-gradient(135deg,#f7d4d4,#e8a0a0)" },
  { image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80&fit=crop&crop=center", label: "Sage & Slow", bg: "linear-gradient(135deg,#c8d8c0,#8aaa80)" },
  { image: "https://i.pinimg.com/originals/12/53/e3/1253e3e3b0878fbe99a1dfa39686ebb9.jpg", label: "Sharara Dreams", bg: "linear-gradient(135deg,#e8d0b0,#c0904a)" }
];

/* ---- STARS HELPER ---- */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/* ---- FORMAT PRICE ---- */
function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN');
}

/* ---- BUILD PRODUCT CARD HTML ---- */
function buildProductCard(p, wishlisted = false) {
  const discountBadge = p.discount > 0 ? `<span class="product-badge badge-sale">${p.discount}% Off</span>` : '';
  const newBadge = p.tags.includes('new') ? `<span class="product-badge badge-new">New</span>` : '';
  const bsBadge = p.tags.includes('bestseller') ? `<span class="product-badge badge-bestseller">Best Seller</span>` : '';
  const originalPriceHtml = p.discount > 0 ? `<span class="price-original">${formatPrice(p.originalPrice)}</span><span class="price-discount">${p.discount}% off</span>` : '';
  const heartClass = wishlisted ? 'wishlist-heart active' : 'wishlist-heart';

  return `
    <div class="product-card reveal" data-id="${p.id}">
      <div class="product-img-wrap" onclick="openQuickView(${p.id})">
        <img class="prod-img prod-img-main" src="${p.image}" alt="${p.name}" loading="lazy" />
        <img class="prod-img prod-img-alt" src="${p.imageAlt}" alt="${p.name} alternate view" loading="lazy" />
        <div class="product-badges">${newBadge}${bsBadge}${discountBadge}</div>
        <button class="${heartClass}" onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)" aria-label="Add to wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="quick-view-btn">Quick View</button>
      </div>
      <div class="product-info">
        <p class="product-brand">${p.brand}</p>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-pricing">
          <span class="price-sale">${formatPrice(p.price)}</span>
          ${originalPriceHtml}
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Bag</button>
      </div>
    </div>
  `;
}

/* ---- BUILD TESTIMONIAL CARD ---- */
function buildTestimonialCard(t) {
  return `
    <div class="testimonial-card reveal">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.avatar}</div>
        <div>
          <p class="author-name">${t.name}</p>
          <p class="author-tag">${t.tag}</p>
        </div>
      </div>
    </div>
  `;
}

/* ---- BUILD INSTA ITEM ---- */
function buildInstaItem(item, i) {
  return `
    <div class="insta-item" style="background: ${item.bg}">
      <img class="insta-real-img" src="${item.image}" alt="${item.label}" loading="lazy" />
      <div class="insta-overlay"><span>${item.label}</span></div>
    </div>
  `;
}
